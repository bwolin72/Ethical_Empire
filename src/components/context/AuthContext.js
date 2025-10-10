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

const VALID_ROLES = ["admin", "user", "vendor", "partner"];

const normalizeRole = (role) => role?.trim()?.toLowerCase();
const isValidRole = (role) => VALID_ROLES.includes(normalizeRole(role));

const getStorage = () => {
  const remember = localStorage.getItem(AUTH_KEYS.REMEMBER) === "true";
  return remember ? localStorage : sessionStorage;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const refreshTimer = useRef(null);
  const profileSyncTimer = useRef(null);
  const refreshAccessTokenRef = useRef(null);

  const [auth, setAuth] = useState({
    access: null,
    refresh: null,
    user: null,
    isAuthenticated: false,
  });

  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(
    localStorage.getItem(AUTH_KEYS.LAST_SYNC) || null
  );

  // =========================
  // 🧹 Clear Session
  // =========================
  const clearSession = useCallback(() => {
    clearTimeout(refreshTimer.current);
    clearTimeout(profileSyncTimer.current);
    Object.values(AUTH_KEYS).forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }, []);

  // =========================
  // 🚫 Logout
  // =========================
  const logout = useCallback(
    (reason = "manual") => {
      console.warn(`[Auth] Logging out. Reason: ${reason}`);
      clearSession();
      setAuth({ access: null, refresh: null, user: null, isAuthenticated: false });
      setReady(true);
      navigate("/login", { replace: true });
    },
    [navigate, clearSession]
  );

  // =========================
  // ⏱️ Schedule Token Refresh
  // =========================
  const scheduleTokenRefresh = useCallback(
    (accessToken, refreshToken) => {
      try {
        const { exp } = jwt_decode(accessToken);
        const delay = exp * 1000 - Date.now() - 60_000;
        clearTimeout(refreshTimer.current);

        if (delay <= 0) refreshAccessTokenRef.current?.(refreshToken);
        else
          refreshTimer.current = setTimeout(
            () => refreshAccessTokenRef.current?.(refreshToken),
            delay
          );
      } catch (err) {
        console.error("Token decode failed:", err);
        logout("token_decode_failed");
      }
    },
    [logout]
  );

  // =========================
  // 🔄 Refresh Access Token
  // =========================
  const refreshAccessToken = useCallback(
    async (refreshToken) => {
      if (!refreshToken) return logout("missing_refresh_token");

      try {
        const refreshUrl =
          process.env.REACT_APP_API_REFRESH_URL || "/accounts/token/refresh/";
        const { data } = await axiosInstance.post(refreshUrl, { refresh: refreshToken });

        const newAccess = data.access;
        if (!newAccess) throw new Error("No access token returned");

        const storage = getStorage();
        storage.setItem(AUTH_KEYS.ACCESS, newAccess);

        setAuth((prev) => ({ ...prev, access: newAccess }));
        scheduleTokenRefresh(newAccess, refreshToken);
      } catch (err) {
        console.error("Refresh token error:", err);
        toast.error("Session expired, please log in again.");
        logout("refresh_failed");
      }
    },
    [logout, scheduleTokenRefresh]
  );

  useEffect(() => {
    refreshAccessTokenRef.current = refreshAccessToken;
  }, [refreshAccessToken]);

  // =========================
  // 🔐 Login
  // =========================
  const login = useCallback(
    ({ access, refresh, user, remember = true }) => {
      if (!access || !refresh || !user) return logout("invalid_login_data");

      let role = normalizeRole(user.role);
      if (!isValidRole(role)) {
        console.warn("[Auth] Invalid or missing role. Defaulting to 'user'.");
        role = "user";
      }
      if (!user.email) return logout("invalid_user_role");

      const cleanUser = { ...user, role };
      const storage = remember ? localStorage : sessionStorage;
      localStorage.setItem(AUTH_KEYS.REMEMBER, remember ? "true" : "false");

      storage.setItem(AUTH_KEYS.ACCESS, access);
      storage.setItem(AUTH_KEYS.REFRESH, refresh);
      storage.setItem(AUTH_KEYS.USER, JSON.stringify(cleanUser));

      setAuth({ access, refresh, user: cleanUser, isAuthenticated: true });
      scheduleTokenRefresh(access, refresh);
      scheduleProfileSync(access);
      setReady(true);
    },
    [logout, scheduleTokenRefresh]
  );

  // =========================
  // 🔧 Update Session
  // =========================
  const update = useCallback(({ access, refresh, user }) => {
    const storage = getStorage();
    setAuth((prev) => {
      const updated = { ...prev };
      if (access !== undefined) {
        storage.setItem(AUTH_KEYS.ACCESS, access);
        updated.access = access;
      }
      if (refresh !== undefined) {
        storage.setItem(AUTH_KEYS.REFRESH, refresh);
        updated.refresh = refresh;
      }
      if (user !== undefined) {
        let role = normalizeRole(user.role);
        if (!isValidRole(role)) role = "user";
        updated.user = { ...user, role };
        storage.setItem(AUTH_KEYS.USER, JSON.stringify(updated.user));
      }
      return updated;
    });
  }, []);

  // =========================
  // 🔁 Silent Profile Sync (Every 4 hours)
  // =========================
  const scheduleProfileSync = useCallback(
    (accessToken) => {
      clearTimeout(profileSyncTimer.current);
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
            storage.setItem(AUTH_KEYS.USER, JSON.stringify(updatedUser));

            const timestamp = new Date().toISOString();
            localStorage.setItem(AUTH_KEYS.LAST_SYNC, timestamp);
            setLastSyncedAt(timestamp);

            setAuth((prev) => ({ ...prev, user: updatedUser }));
            console.info("[Auth] Silent profile sync successful at", timestamp);
          }
        } catch (err) {
          console.warn("[Auth] Silent profile sync failed:", err?.response?.status || err);
        } finally {
          profileSyncTimer.current = setTimeout(() => sync(), SYNC_INTERVAL);
        }
      };

      sync();
    },
    []
  );

  // =========================
  // 🚀 Init Session
  // =========================
  useEffect(() => {
    const storage = getStorage();
    const access = storage.getItem(AUTH_KEYS.ACCESS);
    const refresh = storage.getItem(AUTH_KEYS.REFRESH);
    const userRaw = storage.getItem(AUTH_KEYS.USER);

    const init = async () => {
      if (!access || !refresh || !userRaw) {
        setLoading(false);
        setReady(true);
        return;
      }

      try {
        const user = JSON.parse(userRaw);
        let role = normalizeRole(user.role);
        if (!isValidRole(role)) {
          console.warn("[Auth] Invalid stored role. Defaulting to 'user'.");
          user.role = "user";
        }

        if (!user.email) {
          toast.error("Your account data could not be verified. Please log in again.");
          return logout("invalid_user_data");
        }

        const cleanUser = { ...user, role: user.role };
        const { exp } = jwt_decode(access);
        const isExpired = exp * 1000 < Date.now();

        setAuth({ access, refresh, user: cleanUser, isAuthenticated: !isExpired });

        if (isExpired) await refreshAccessToken(refresh);
        else scheduleTokenRefresh(access, refresh);

        scheduleProfileSync(access);
      } catch (err) {
        console.error("Session init error:", err);
        logout("init_session_failed");
      } finally {
        setLoading(false);
        setReady(true);
      }
    };

    init();
  }, [refreshAccessToken, scheduleTokenRefresh, logout, scheduleProfileSync]);

  // =========================
  // 🧩 Provider Return
  // =========================
  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
        update,
        isAuthenticated: auth.isAuthenticated,
        lastSyncedAt,
        loading,
        ready,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
