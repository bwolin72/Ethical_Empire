import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import jwt_decode from "jwt-decode";

const AuthContext = createContext();
export { AuthContext };

// ===============================
// 🔑 Constants
// ===============================
const AUTH_KEYS = {
  ACCESS: "access",
  REFRESH: "refresh",
  USER: "user",
  REMEMBER: "remember",
  LAST_SYNC: "lastSyncedAt",
};

// Canonical backend roles — keep in sync with backend enum
const VALID_ROLES = ["admin", "user", "vendor", "partner"];

// Helpers
const normalizeRole = (role) => role?.trim()?.toLowerCase();
const isValidRole = (role) => VALID_ROLES.includes(normalizeRole(role));

const safeGetItem = (storage, key) => {
  try {
    return storage.getItem(key);
  } catch (e) {
    return null;
  }
};

const safeSetItem = (storage, key, val) => {
  try {
    storage.setItem(key, val);
  } catch (e) {
    // ignore (storage full / private mode)
  }
};

const getStorage = () => {
  if (typeof window === "undefined") return sessionStorage;
  const remember = safeGetItem(localStorage, AUTH_KEYS.REMEMBER) === "true";
  return remember ? localStorage : sessionStorage;
};

// Clamp timeouts to avoid extremely large timers (browser throttling)
const clampDelay = (ms) => {
  if (!Number.isFinite(ms)) return 5_000;
  const MIN = 5_000; // 5 seconds
  const MAX = 60 * 60 * 1000; // 1 hour
  return Math.min(Math.max(ms, MIN), MAX);
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // refs for timers & callback refs
  const refreshTimer = useRef(null);
  const profileSyncTimer = useRef(null);
  const refreshAccessTokenRef = useRef(null);

  // state
  const [auth, setAuth] = useState({
    access: null,
    refresh: null,
    user: null,
    isAuthenticated: false,
  });

  const [loading, setLoading] = useState(true); // during init
  const [ready, setReady] = useState(false); // indicates initialization finished
  const [lastSyncedAt, setLastSyncedAt] = useState(
    (typeof window !== "undefined" && safeGetItem(localStorage, AUTH_KEYS.LAST_SYNC)) || null
  );

  // --------------------------
  // Helpers: clear timers + storage
  // --------------------------
  const clearTimers = useCallback(() => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
    if (profileSyncTimer.current) {
      clearTimeout(profileSyncTimer.current);
      profileSyncTimer.current = null;
    }
  }, []);

  const clearSession = useCallback(() => {
    clearTimers();
    try {
      Object.values(AUTH_KEYS).forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
    } catch (e) {
      // ignore storage errors
    }
  }, [clearTimers]);

  // --------------------------
  // Logout
  // --------------------------
  const logout = useCallback(
    (reason = "manual") => {
      console.warn(`[Auth] Logging out. Reason: ${reason}`);
      clearSession();
      setAuth({ access: null, refresh: null, user: null, isAuthenticated: false });
      setReady(true);
      // don't leave loading stuck
      setLoading(false);
      navigate("/login", { replace: true });
    },
    [navigate, clearSession]
  );

  // --------------------------
  // Token refresh scheduling
  // --------------------------
  const scheduleTokenRefresh = useCallback(
    (accessToken, refreshToken) => {
      if (!accessToken || !refreshToken) return;
      try {
        const { exp } = jwt_decode(accessToken);
        const msUntilExpiry = exp * 1000 - Date.now();
        // refresh 60 seconds before expiry
        const desiredDelay = msUntilExpiry - 60_000;
        const delay = clampDelay(desiredDelay);
        // clear existing
        if (refreshTimer.current) clearTimeout(refreshTimer.current);

        if (desiredDelay <= 0) {
          // already expired or near-expiry -> refresh now
          refreshAccessTokenRef.current?.(refreshToken);
        } else {
          refreshTimer.current = setTimeout(
            () => refreshAccessTokenRef.current?.(refreshToken),
            delay
          );
        }
      } catch (err) {
        console.error("[Auth] Token decode failed:", err);
        logout("token_decode_failed");
      }
    },
    [logout]
  );

  // --------------------------
  // Refresh access token
  // --------------------------
  const refreshAccessToken = useCallback(
    async (refreshToken) => {
      if (!refreshToken) return logout("missing_refresh_token");

      try {
        const refreshUrl = process.env.REACT_APP_API_REFRESH_URL || "/accounts/token/refresh/";
        const { data } = await axiosInstance.post(refreshUrl, { refresh: refreshToken });

        const newAccess = data?.access;
        if (!newAccess) throw new Error("No access token returned");

        const storage = getStorage();
        safeSetItem(storage, AUTH_KEYS.ACCESS, newAccess);

        setAuth((prev) => ({ ...prev, access: newAccess, isAuthenticated: true }));
        scheduleTokenRefresh(newAccess, refreshToken);
      } catch (err) {
        console.error("[Auth] Refresh token error:", err);
        toast.error("Session expired, please log in again.");
        logout("refresh_failed");
      }
    },
    [logout, scheduleTokenRefresh]
  );

  // keep ref updated so timers can call latest function
  useEffect(() => {
    refreshAccessTokenRef.current = refreshAccessToken;
  }, [refreshAccessToken]);

  // --------------------------
  // Login
  // --------------------------
  const login = useCallback(
    ({ access, refresh, user, remember = true }) => {
      if (!access || !refresh || !user) {
        return logout("invalid_login_data");
      }

      // Normalize role and fallback
      let role = normalizeRole(user.role);
      if (!isValidRole(role)) {
        // map some known legacy aliases to canonical role 'user' if necessary
        if (["client", "normal", "member", "basic"].includes(role)) role = "user";
        else {
          console.warn("[Auth] Invalid or missing role. Defaulting to 'user'.");
          role = "user";
        }
      }

      if (!user.email) return logout("invalid_user_role");

      const cleanUser = { ...user, role };

      const storage = remember ? localStorage : sessionStorage;
      safeSetItem(localStorage, AUTH_KEYS.REMEMBER, remember ? "true" : "false");
      safeSetItem(storage, AUTH_KEYS.ACCESS, access);
      safeSetItem(storage, AUTH_KEYS.REFRESH, refresh);
      safeSetItem(storage, AUTH_KEYS.USER, JSON.stringify(cleanUser));

      setAuth({ access, refresh, user: cleanUser, isAuthenticated: true });
      scheduleTokenRefresh(access, refresh);
      scheduleProfileSync(access); // start sync immediately
      setReady(true);
      setLoading(false);
    },
    [logout, scheduleTokenRefresh]
  );

  // --------------------------
  // Update session pieces
  // --------------------------
  const update = useCallback(({ access, refresh, user }) => {
    const storage = getStorage();
    setAuth((prev) => {
      const updated = { ...prev };
      if (access !== undefined) {
        safeSetItem(storage, AUTH_KEYS.ACCESS, access);
        updated.access = access;
      }
      if (refresh !== undefined) {
        safeSetItem(storage, AUTH_KEYS.REFRESH, refresh);
        updated.refresh = refresh;
      }
      if (user !== undefined) {
        let role = normalizeRole(user.role);
        if (!isValidRole(role)) {
          // map legacy aliases to canonical roles if plausible
          if (["client", "normal", "member", "basic"].includes(role)) role = "user";
          else role = "user";
        }
        updated.user = { ...user, role };
        safeSetItem(storage, AUTH_KEYS.USER, JSON.stringify(updated.user));
      }
      return updated;
    });
  }, []);

  // --------------------------
  // Silent profile sync (every 4 hours)
  // --------------------------
  const scheduleProfileSync = useCallback(
    (accessToken) => {
      // clear previous timer
      if (profileSyncTimer.current) {
        clearTimeout(profileSyncTimer.current);
        profileSyncTimer.current = null;
      }
      if (!accessToken) return;

      const SYNC_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours

      const sync = async () => {
        try {
          const { data } = await axiosInstance.get("/accounts/profile/", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (data) {
            const role = normalizeRole(data.role);
            const updatedUser = { ...data, role: isValidRole(role) ? role : "user" };
            const storage = getStorage();
            safeSetItem(storage, AUTH_KEYS.USER, JSON.stringify(updatedUser));

            const timestamp = new Date().toISOString();
            safeSetItem(localStorage, AUTH_KEYS.LAST_SYNC, timestamp);
            setLastSyncedAt(timestamp);

            setAuth((prev) => ({ ...prev, user: updatedUser }));
            console.info("[Auth] Silent profile sync successful at", timestamp);
          }
        } catch (err) {
          // if token expired / unauthorized, attempt to refresh once
          const status = err?.response?.status;
          console.warn("[Auth] Silent profile sync failed:", status || err);
          if (status === 401) {
            // attempt refresh using stored refresh token
            const storage = getStorage();
            const storedRefresh = safeGetItem(storage, AUTH_KEYS.REFRESH);
            if (storedRefresh) {
              try {
                await refreshAccessToken(storedRefresh);
              } catch (e) {
                // refreshAccessToken already handles logout on failure
              }
            } else {
              logout("profile_sync_unauthorized");
            }
          }
        } finally {
          // schedule next run (use clamp to avoid very long timers)
          profileSyncTimer.current = setTimeout(() => sync(), clampDelay(SYNC_INTERVAL));
        }
      };

      // run immediate sync
      sync();
    },
    [refreshAccessToken, logout]
  );

  // --------------------------
  // Initialize session on mount
  // --------------------------
  useEffect(() => {
    let mounted = true;
    const storage = getStorage();
    const access = safeGetItem(storage, AUTH_KEYS.ACCESS);
    const refresh = safeGetItem(storage, AUTH_KEYS.REFRESH);
    const userRaw = safeGetItem(storage, AUTH_KEYS.USER);

    const init = async () => {
      if (!access || !refresh || !userRaw) {
        if (!mounted) return;
        setLoading(false);
        setReady(true);
        // leave auth as logged out
        return;
      }

      try {
        const parsed = JSON.parse(userRaw);
        let role = normalizeRole(parsed.role);
        if (!isValidRole(role)) {
          if (["client", "normal", "member", "basic"].includes(role)) role = "user";
          else {
            console.warn("[Auth] Invalid stored role. Defaulting to 'user'.");
            role = "user";
          }
          parsed.role = role;
        }

        if (!parsed.email) {
          toast.error("Your account data could not be verified. Please log in again.");
          return logout("invalid_user_data");
        }

        const cleanUser = { ...parsed, role: parsed.role };
        const { exp } = jwt_decode(access);
        const isExpired = exp * 1000 < Date.now();

        if (!mounted) return;
        setAuth({ access, refresh, user: cleanUser, isAuthenticated: !isExpired });

        if (isExpired) {
          // refresh and schedule on success
          await refreshAccessToken(refresh);
        } else {
          scheduleTokenRefresh(access, refresh);
        }

        scheduleProfileSync(access);
      } catch (err) {
        console.error("[Auth] Session init error:", err);
        logout("init_session_failed");
      } finally {
        if (!mounted) return;
        setLoading(false);
        setReady(true);
      }
    };

    init();

    // cleanup on unmount
    return () => {
      mounted = false;
      clearTimers();
    };
  }, [refreshAccessToken, scheduleTokenRefresh, logout, scheduleProfileSync, clearTimers]);

  // clear timers if provider unmounted (safeguard)
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // --------------------------
  // Context value (convenience fields added)
  // --------------------------
  const contextValue = {
    auth,
    user: auth.user,
    role: auth.user?.role,
    accessToken: auth.access,
    login,
    logout,
    update,
    isAuthenticated: !!auth.isAuthenticated,
    lastSyncedAt,
    loading,
    ready,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
