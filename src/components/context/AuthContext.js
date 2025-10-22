// ============================================
// 🧩 AuthProvider.jsx — Full, Clean, Enhanced
// ============================================

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import jwt_decode from "jwt-decode";

// ===============================
// 🔑 Context Setup
// ===============================
const AuthContext = createContext();
export { AuthContext };

// ===============================
// 🔧 Constants
// ===============================
const AUTH_KEYS = {
  ACCESS: "access",
  REFRESH: "refresh",
  USER: "user",
  REMEMBER: "remember",
  LAST_SYNC: "lastSyncedAt",
};

const VALID_ROLES = ["admin", "user", "vendor", "partner"];
const normalizeRole = (role) => role?.trim()?.toLowerCase();
const isValidRole = (role) => VALID_ROLES.includes(normalizeRole(role));

const safeGetItem = (storage, key) => {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (storage, key, val) => {
  try {
    storage.setItem(key, val);
  } catch {}
};

const safeRemoveItem = (storage, key) => {
  try {
    storage.removeItem(key);
  } catch {}
};

const getStorage = () => {
  if (typeof window === "undefined") return sessionStorage;
  const remember = safeGetItem(localStorage, AUTH_KEYS.REMEMBER) === "true";
  return remember ? localStorage : sessionStorage;
};

const clampDelay = (ms) =>
  Math.min(Math.max(Number.isFinite(ms) ? ms : 5000, 5000), 3600000);

// ===============================
// 🌐 AuthProvider Component
// ===============================
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const refreshTimer = useRef(null);
  const profileSyncTimer = useRef(null);
  const refreshFnRef = useRef(null);

  const [auth, setAuth] = useState({
    access: null,
    refresh: null,
    user: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(
    safeGetItem(localStorage, AUTH_KEYS.LAST_SYNC)
  );

  // ============================
  // 🧹 Utility Helpers
  // ============================
  const clearTimers = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    if (profileSyncTimer.current) clearTimeout(profileSyncTimer.current);
  }, []);

  const clearSession = useCallback(() => {
    clearTimers();
    [localStorage, sessionStorage].forEach((s) => {
      Object.values(AUTH_KEYS).forEach((k) => safeRemoveItem(s, k));
    });
  }, [clearTimers]);

  // ============================
  // 🚪 Logout
  // ============================
  const logout = useCallback(
    (reason = "manual") => {
      console.warn(`[Auth] Logout triggered. Reason: ${reason}`);
      clearSession();
      setAuth({ access: null, refresh: null, user: null, isAuthenticated: false });
      setLoading(false);
      setReady(true);
      navigate("/login", { replace: true });
    },
    [clearSession, navigate]
  );

  // ============================
  // ♻️ Token Refresh Handling
  // ============================
  const scheduleTokenRefresh = useCallback(
    (access, refresh) => {
      if (!access || !refresh) return;

      try {
        const { exp } = jwt_decode(access);
        const delay = clampDelay(exp * 1000 - Date.now() - 60_000); // refresh 1 min before expiry

        clearTimeout(refreshTimer.current);

        if (delay <= 0) refreshFnRef.current?.(refresh);
        else refreshTimer.current = setTimeout(() => refreshFnRef.current?.(refresh), delay);
      } catch (err) {
        console.error("[Auth] Token decode error:", err);
        logout("token_decode_failed");
      }
    },
    [logout]
  );

  const refreshAccessToken = useCallback(
    async (refresh) => {
      if (!refresh) return logout("missing_refresh_token");

      try {
        const url = process.env.REACT_APP_API_REFRESH_URL || "/accounts/token/refresh/";
        const { data } = await axiosInstance.post(url, { refresh });

        if (!data?.access) throw new Error("Invalid response: missing access token");

        const storage = getStorage();
        safeSetItem(storage, AUTH_KEYS.ACCESS, data.access);

        setAuth((prev) => ({
          ...prev,
          access: data.access,
          isAuthenticated: true,
        }));

        scheduleTokenRefresh(data.access, refresh);
        return data.access;
      } catch (err) {
        console.error("[Auth] Token refresh failed:", err);
        toast.error("Session expired. Please log in again.");
        logout("refresh_failed");
      }
    },
    [logout, scheduleTokenRefresh]
  );

  useEffect(() => {
    refreshFnRef.current = refreshAccessToken;
  }, [refreshAccessToken]);

  // ============================
  // 🔐 Login & OAuth
  // ============================
  const login = useCallback(
    ({ access, refresh, user, remember = true }) => {
      if (!access || !refresh || !user) return logout("invalid_login_data");

      const storage = remember ? localStorage : sessionStorage;
      const normalizedRole = normalizeRole(user.role);
      const finalUser = { ...user, role: isValidRole(normalizedRole) ? normalizedRole : "user" };

      safeSetItem(localStorage, AUTH_KEYS.REMEMBER, remember ? "true" : "false");
      safeSetItem(storage, AUTH_KEYS.ACCESS, access);
      safeSetItem(storage, AUTH_KEYS.REFRESH, refresh);
      safeSetItem(storage, AUTH_KEYS.USER, JSON.stringify(finalUser));

      setAuth({ access, refresh, user: finalUser, isAuthenticated: true });

      scheduleTokenRefresh(access, refresh);
      scheduleProfileSync(access);

      setReady(true);
      setLoading(false);
    },
    [logout, scheduleTokenRefresh]
  );

  const loginWithGoogle = useCallback(
    async (googleToken, remember = true) => {
      if (!googleToken) throw new Error("Missing Google token");

      try {
        const { data } = await axiosInstance.post("/accounts/google-login/", { token: googleToken });
        const { access, refresh, user } = data;
        if (!access || !refresh || !user) throw new Error("Invalid Google login response");

        login({ access, refresh, user, remember });
        return user;
      } catch (err) {
        console.error("[Auth] Google login failed:", err);
        throw err;
      }
    },
    [login]
  );

  // ============================
  // 🔁 Update session
  // ============================
  const update = useCallback(({ access, refresh, user }) => {
    const storage = getStorage();

    setAuth((prev) => {
      const updated = { ...prev };

      if (access) {
        safeSetItem(storage, AUTH_KEYS.ACCESS, access);
        updated.access = access;
      }

      if (refresh) {
        safeSetItem(storage, AUTH_KEYS.REFRESH, refresh);
        updated.refresh = refresh;
      }

      if (user) {
        const normalizedRole = normalizeRole(user.role);
        const cleanUser = { ...user, role: isValidRole(normalizedRole) ? normalizedRole : "user" };
        safeSetItem(storage, AUTH_KEYS.USER, JSON.stringify(cleanUser));
        updated.user = cleanUser;
      }

      return updated;
    });
  }, []);

  // ============================
  // 🔄 Profile Sync
  // ============================
  const scheduleProfileSync = useCallback(
    (access) => {
      if (!access) return;
      clearTimeout(profileSyncTimer.current);

      const SYNC_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours

      const syncProfile = async () => {
        try {
          const { data } = await axiosInstance.get("/accounts/profile/", {
            headers: { Authorization: `Bearer ${access}` },
          });

          if (data) {
            const normalizedRole = normalizeRole(data.role);
            const updatedUser = {
              ...data,
              role: isValidRole(normalizedRole) ? normalizedRole : "user",
            };

            const storage = getStorage();
            safeSetItem(storage, AUTH_KEYS.USER, JSON.stringify(updatedUser));
            safeSetItem(localStorage, AUTH_KEYS.LAST_SYNC, new Date().toISOString());

            setLastSyncedAt(new Date().toISOString());
            setAuth((prev) => ({ ...prev, user: updatedUser }));
          }
        } catch (err) {
          const status = err?.response?.status;
          if (status === 401) {
            const storedRefresh = safeGetItem(getStorage(), AUTH_KEYS.REFRESH);
            if (storedRefresh) await refreshAccessToken(storedRefresh);
            else logout("profile_sync_unauthorized");
          }
        } finally {
          profileSyncTimer.current = setTimeout(syncProfile, clampDelay(SYNC_INTERVAL));
        }
      };

      syncProfile();
    },
    [refreshAccessToken, logout]
  );

  // ============================
  // 🧭 Initialization
  // ============================
  useEffect(() => {
    let active = true;
    const storage = getStorage();
    const access = safeGetItem(storage, AUTH_KEYS.ACCESS);
    const refresh = safeGetItem(storage, AUTH_KEYS.REFRESH);
    const userRaw = safeGetItem(storage, AUTH_KEYS.USER);

    const initialize = async () => {
      if (!access || !refresh || !userRaw) {
        if (active) {
          setLoading(false);
          setReady(true);
        }
        return;
      }

      try {
        const parsedUser = JSON.parse(userRaw);
        const normalizedRole = normalizeRole(parsedUser.role);
        const finalUser = {
          ...parsedUser,
          role: isValidRole(normalizedRole) ? normalizedRole : "user",
        };

        const { exp } = jwt_decode(access);
        const expired = exp * 1000 < Date.now();

        setAuth({
          access,
          refresh,
          user: finalUser,
          isAuthenticated: !expired,
        });

        if (expired) await refreshAccessToken(refresh);
        else scheduleTokenRefresh(access, refresh);

        scheduleProfileSync(access);
      } catch (err) {
        console.error("[Auth] Initialization error:", err);
        logout("init_session_failed");
      } finally {
        if (active) {
          setLoading(false);
          setReady(true);
        }
      }
    };

    initialize();
    return () => {
      active = false;
      clearTimers();
    };
  }, [refreshAccessToken, scheduleTokenRefresh, logout, scheduleProfileSync, clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // ============================
  // 🧭 Context Value
  // ============================
  const contextValue = {
    auth,
    user: auth.user,
    role: auth.user?.role,
    accessToken: auth.access,
    login,
    loginWithGoogle,
    logout,
    update,
    isAuthenticated: auth.isAuthenticated,
    lastSyncedAt,
    loading,
    ready,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// ===============================
// 🔎 Hook
// ===============================
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
