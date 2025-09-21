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
import jwt_decode from "jwt-decode"; // ✅ Correct default import

// ===== Constants =====
const AuthContext = createContext();
const AUTH_KEYS = {
  ACCESS: "access",
  REFRESH: "refresh",
  USER: "user",
  REMEMBER: "remember",
};
const VALID_ROLES = ["admin", "user", "vendor", "partner"];

// ===== Helpers =====
const normalizeRole = (role) => role?.trim().toLowerCase();
const isValidRole = (role) => VALID_ROLES.includes(normalizeRole(role));

const getStorage = () => {
  const remember = localStorage.getItem(AUTH_KEYS.REMEMBER) === "true";
  return remember ? localStorage : sessionStorage;
};

// ===== Provider =====
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const refreshTimer = useRef(null);
  const refreshAccessTokenRef = useRef(null);

  const [auth, setAuth] = useState({
    access: null,
    refresh: null,
    user: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  // === Clear session ===
  const clearSession = useCallback(() => {
    clearTimeout(refreshTimer.current);
    Object.values(AUTH_KEYS).forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }, []);

  // === Logout ===
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

  // === Schedule token refresh ===
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
      } catch {
        logout("token_decode_failed");
      }
    },
    [logout]
  );

  // === Refresh token ===
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
      } catch {
        toast.error("Session expired, please log in again.");
        logout("refresh_failed");
      }
    },
    [logout, scheduleTokenRefresh]
  );

  useEffect(() => {
    refreshAccessTokenRef.current = refreshAccessToken;
  }, [refreshAccessToken]);

  // === Login ===
  const login = useCallback(
    ({ access, refresh, user, remember = true }) => {
      if (!access || !refresh || !user) return logout("invalid_login_data");

      const role = normalizeRole(user.role);
      if (!user.email || !isValidRole(role)) return logout("invalid_user_role");

      const cleanUser = { ...user, role };
      const storage = remember ? localStorage : sessionStorage;
      localStorage.setItem(AUTH_KEYS.REMEMBER, remember ? "true" : "false");

      storage.setItem(AUTH_KEYS.ACCESS, access);
      storage.setItem(AUTH_KEYS.REFRESH, refresh);
      storage.setItem(AUTH_KEYS.USER, JSON.stringify(cleanUser));

      setAuth({ access, refresh, user: cleanUser, isAuthenticated: true });
      scheduleTokenRefresh(access, refresh);
      setReady(true);
    },
    [logout, scheduleTokenRefresh]
  );

  // === Update user/session ===
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
        const role = normalizeRole(user.role);
        updated.user = { ...user, role };
        storage.setItem(AUTH_KEYS.USER, JSON.stringify(updated.user));
      }
      return updated;
    });
  }, []);

  // === Init session ===
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
        const role = normalizeRole(user.role);
        if (!user.email || !isValidRole(role)) return logout("invalid_user_data");

        const cleanUser = { ...user, role };
        const { exp } = jwt_decode(access);
        const isExpired = exp * 1000 < Date.now();

        setAuth({ access, refresh, user: cleanUser, isAuthenticated: !isExpired });

        if (isExpired) await refreshAccessToken(refresh);
        else scheduleTokenRefresh(access, refresh);
      } catch {
        logout("init_session_failed");
      } finally {
        setLoading(false);
        setReady(true);
      }
    };

    init();
  }, [refreshAccessToken, scheduleTokenRefresh, logout]);

  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
        update,
        isAuthenticated: auth.isAuthenticated,
        loading,
        ready,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
