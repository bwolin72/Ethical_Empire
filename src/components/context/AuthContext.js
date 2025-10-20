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

const safeGetItem = (storage, key) => {
  try { return storage.getItem(key); } catch { return null; }
};
const safeSetItem = (storage, key, val) => {
  try { storage.setItem(key, val); } catch {}
};
const getStorage = () => {
  if (typeof window === "undefined") return sessionStorage;
  const remember = safeGetItem(localStorage, AUTH_KEYS.REMEMBER) === "true";
  return remember ? localStorage : sessionStorage;
};
const clampDelay = (ms) => Math.min(Math.max(Number.isFinite(ms) ? ms : 5000, 5000), 3600000);

// ===============================
// 🔑 Auth Provider
// ===============================
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
    (typeof window !== "undefined" && safeGetItem(localStorage, AUTH_KEYS.LAST_SYNC)) || null
  );

  // --------------------------
  // Helpers
  // --------------------------
  const clearTimers = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    if (profileSyncTimer.current) clearTimeout(profileSyncTimer.current);
  }, []);

  const clearSession = useCallback(() => {
    clearTimers();
    Object.values(AUTH_KEYS).forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }, [clearTimers]);

  // --------------------------
  // Logout
  // --------------------------
  const logout = useCallback((reason = "manual") => {
    console.warn(`[Auth] Logging out. Reason: ${reason}`);
    clearSession();
    setAuth({ access: null, refresh: null, user: null, isAuthenticated: false });
    setReady(true);
    setLoading(false);
    navigate("/login", { replace: true });
  }, [clearSession, navigate]);

  // --------------------------
  // Token Refresh
  // --------------------------
  const scheduleTokenRefresh = useCallback((accessToken, refreshToken) => {
    if (!accessToken || !refreshToken) return;
    try {
      const { exp } = jwt_decode(accessToken);
      const delay = clampDelay(exp * 1000 - Date.now() - 60000);
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      if (delay <= 0) refreshAccessTokenRef.current?.(refreshToken);
      else refreshTimer.current = setTimeout(() => refreshAccessTokenRef.current?.(refreshToken), delay);
    } catch { logout("token_decode_failed"); }
  }, [logout]);

  const refreshAccessToken = useCallback(async (refreshToken) => {
    if (!refreshToken) return logout("missing_refresh_token");
    try {
      const { data } = await axiosInstance.post(process.env.REACT_APP_API_REFRESH_URL || "/accounts/token/refresh/", { refresh: refreshToken });
      if (!data?.access) throw new Error("No access token returned");
      const storage = getStorage();
      safeSetItem(storage, AUTH_KEYS.ACCESS, data.access);
      setAuth(prev => ({ ...prev, access: data.access, isAuthenticated: true }));
      scheduleTokenRefresh(data.access, refreshToken);
    } catch {
      toast.error("Session expired, please log in again.");
      logout("refresh_failed");
    }
  }, [logout, scheduleTokenRefresh]);

  useEffect(() => { refreshAccessTokenRef.current = refreshAccessToken; }, [refreshAccessToken]);

  // --------------------------
  // Login & Google OAuth Login
  // --------------------------
  const login = useCallback(({ access, refresh, user, remember = true }) => {
    if (!access || !refresh || !user) return logout("invalid_login_data");
    let role = normalizeRole(user.role);
    if (!isValidRole(role)) role = "user";
    const cleanUser = { ...user, role };
    const storage = remember ? localStorage : sessionStorage;
    safeSetItem(localStorage, AUTH_KEYS.REMEMBER, remember ? "true" : "false");
    safeSetItem(storage, AUTH_KEYS.ACCESS, access);
    safeSetItem(storage, AUTH_KEYS.REFRESH, refresh);
    safeSetItem(storage, AUTH_KEYS.USER, JSON.stringify(cleanUser));
    setAuth({ access, refresh, user: cleanUser, isAuthenticated: true });
    scheduleTokenRefresh(access, refresh);
    scheduleProfileSync(access);
    setReady(true);
    setLoading(false);
  }, [logout, scheduleTokenRefresh]);

  const loginWithGoogle = useCallback(async (googleToken, remember = true) => {
    if (!googleToken) throw new Error("Missing Google token");
    try {
      const { data } = await axiosInstance.post("/accounts/google-login/", { token: googleToken });
      const { access, refresh, user } = data;
      if (!access || !refresh || !user) throw new Error("Invalid server response");
      login({ access, refresh, user, remember });
      return user;
    } catch (err) {
      console.error("[Auth] Google login failed:", err);
      throw err;
    }
  }, [login]);

  // --------------------------
  // Update session
  // --------------------------
  const update = useCallback(({ access, refresh, user }) => {
    const storage = getStorage();
    setAuth(prev => {
      const updated = { ...prev };
      if (access !== undefined) { safeSetItem(storage, AUTH_KEYS.ACCESS, access); updated.access = access; }
      if (refresh !== undefined) { safeSetItem(storage, AUTH_KEYS.REFRESH, refresh); updated.refresh = refresh; }
      if (user !== undefined) { 
        const role = normalizeRole(user.role);
        updated.user = { ...user, role: isValidRole(role) ? role : "user" };
        safeSetItem(storage, AUTH_KEYS.USER, JSON.stringify(updated.user));
      }
      return updated;
    });
  }, []);

  // --------------------------
  // Profile sync
  // --------------------------
  const scheduleProfileSync = useCallback((accessToken) => {
    if (!accessToken) return;
    if (profileSyncTimer.current) clearTimeout(profileSyncTimer.current);

    const SYNC_INTERVAL = 4 * 60 * 60 * 1000;
    const sync = async () => {
      try {
        const { data } = await axiosInstance.get("/accounts/profile/", { headers: { Authorization: `Bearer ${accessToken}` }});
        if (data) {
          const role = normalizeRole(data.role);
          const updatedUser = { ...data, role: isValidRole(role) ? role : "user" };
          safeSetItem(getStorage(), AUTH_KEYS.USER, JSON.stringify(updatedUser));
          safeSetItem(localStorage, AUTH_KEYS.LAST_SYNC, new Date().toISOString());
          setLastSyncedAt(new Date().toISOString());
          setAuth(prev => ({ ...prev, user: updatedUser }));
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401) {
          const storedRefresh = safeGetItem(getStorage(), AUTH_KEYS.REFRESH);
          if (storedRefresh) await refreshAccessToken(storedRefresh);
          else logout("profile_sync_unauthorized");
        }
      } finally {
        profileSyncTimer.current = setTimeout(sync, clampDelay(SYNC_INTERVAL));
      }
    };
    sync();
  }, [refreshAccessToken, logout]);

  // --------------------------
  // Initialize session
  // --------------------------
  useEffect(() => {
    let mounted = true;
    const storage = getStorage();
    const access = safeGetItem(storage, AUTH_KEYS.ACCESS);
    const refresh = safeGetItem(storage, AUTH_KEYS.REFRESH);
    const userRaw = safeGetItem(storage, AUTH_KEYS.USER);

    const init = async () => {
      if (!access || !refresh || !userRaw) { setLoading(false); setReady(true); return; }
      try {
        const parsed = JSON.parse(userRaw);
        parsed.role = normalizeRole(parsed.role);
        if (!isValidRole(parsed.role)) parsed.role = "user";
        const cleanUser = { ...parsed, role: parsed.role };
        const { exp } = jwt_decode(access);
        const isExpired = exp * 1000 < Date.now();
        setAuth({ access, refresh, user: cleanUser, isAuthenticated: !isExpired });
        if (isExpired) await refreshAccessToken(refresh);
        else scheduleTokenRefresh(access, refresh);
        scheduleProfileSync(access);
      } catch { logout("init_session_failed"); }
      finally { if (mounted) { setLoading(false); setReady(true); } }
    };
    init();
    return () => { mounted = false; clearTimers(); };
  }, [refreshAccessToken, scheduleTokenRefresh, logout, scheduleProfileSync, clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const contextValue = {
    auth,
    user: auth.user,
    role: auth.user?.role,
    accessToken: auth.access,
    login,
    loginWithGoogle, // <-- added
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
