import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

// ------------------------------
// Constants & Helpers
// ------------------------------
const AuthContext = createContext();

const AUTH_KEYS = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  USER: 'user',
  REMEMBER: 'remember',
};

const VALID_ROLES = ['admin', 'user', 'vendor', 'partner'];

const normalizeRole = (role) => role?.trim().toLowerCase();
const isValidRole = (role) => VALID_ROLES.includes(normalizeRole(role));

// ------------------------------
// Provider
// ------------------------------
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Refs for timers and callbacks
  const refreshTimer = useRef(null);
  const refreshAccessTokenRef = useRef(null);

  // State
  const [auth, setAuth] = useState({ access: null, refresh: null, user: null });
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  // ------------------------------
  // Session Management
  // ------------------------------
  const clearSession = useCallback(() => {
    clearTimeout(refreshTimer.current);
    Object.values(AUTH_KEYS).forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }, []);

  const logout = useCallback(
    (reason = 'manual') => {
      console.warn(`[Auth] Logging out. Reason: ${reason}`);
      clearSession();
      setAuth({ access: null, refresh: null, user: null });
      setReady(true);
      navigate('/login', { replace: true });
    },
    [navigate, clearSession]
  );

  // ------------------------------
  // Token Refresh
  // ------------------------------
  const scheduleTokenRefresh = useCallback(
    (accessToken, refreshToken) => {
      try {
        const { exp } = jwtDecode(accessToken);
        const delay = exp * 1000 - Date.now() - 60_000; // refresh 1 min before expiry
        console.log('[Auth] Next refresh in', delay / 1000, 'seconds');

        clearTimeout(refreshTimer.current);
        if (delay <= 0) {
          refreshAccessTokenRef.current?.(refreshToken);
        } else {
          refreshTimer.current = setTimeout(
            () => refreshAccessTokenRef.current?.(refreshToken),
            delay
          );
        }
      } catch {
        logout('token_decode_failed');
      }
    },
    [logout]
  );

  const refreshAccessToken = useCallback(
    async (refreshToken) => {
      if (!refreshToken) return logout('missing_refresh_token');

      try {
        const refreshUrl =
          process.env.REACT_APP_API_REFRESH_URL || '/accounts/token/refresh/';
        const { data } = await axiosInstance.post(refreshUrl, { refresh: refreshToken });

        const newAccess = data.access;
        if (!newAccess) throw new Error('No access token returned');

        const remember = localStorage.getItem(AUTH_KEYS.REMEMBER) === 'true';
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(AUTH_KEYS.ACCESS, newAccess);

        setAuth((prev) => ({ ...prev, access: newAccess }));
        scheduleTokenRefresh(newAccess, refreshToken);
      } catch (err) {
        console.error('[Auth] Token refresh failed:', err);
        toast.error('Session expired, please log in again.');
        logout('refresh_failed');
      }
    },
    [logout, scheduleTokenRefresh]
  );

  useEffect(() => {
    refreshAccessTokenRef.current = refreshAccessToken;
  }, [refreshAccessToken]);

  // ------------------------------
  // Login / Update
  // ------------------------------
  const login = useCallback(
    ({ access, refresh, user, remember = true }) => {
      if (!access || !refresh || !user) return logout('invalid_login_data');

      const role = normalizeRole(user.role);
      if (!user.email || !isValidRole(role)) return logout('invalid_user_role');

      const cleanUser = { ...user, role };
      const storage = remember ? localStorage : sessionStorage;
      localStorage.setItem(AUTH_KEYS.REMEMBER, remember ? 'true' : 'false');

      storage.setItem(AUTH_KEYS.ACCESS, access);
      storage.setItem(AUTH_KEYS.REFRESH, refresh);
      storage.setItem(AUTH_KEYS.USER, JSON.stringify(cleanUser));

      console.log('[Auth] Logged in user role:', role);
      setAuth({ access, refresh, user: cleanUser });
      scheduleTokenRefresh(access, refresh);
      setReady(true);
    },
    [logout, scheduleTokenRefresh]
  );

  const update = useCallback(({ access, refresh, user }) => {
    const remember = localStorage.getItem(AUTH_KEYS.REMEMBER) === 'true';
    const storage = remember ? localStorage : sessionStorage;

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

  // ------------------------------
  // Initial Session Load
  // ------------------------------
  useEffect(() => {
    const remember = localStorage.getItem(AUTH_KEYS.REMEMBER) === 'true';
    const storage = remember ? localStorage : sessionStorage;

    const access = storage.getItem(AUTH_KEYS.ACCESS);
    const refresh = storage.getItem(AUTH_KEYS.REFRESH);
    const userRaw = storage.getItem(AUTH_KEYS.USER);

    console.log('[Auth] Initializing session from storage...');
    console.log('[Auth] Stored values:', { access, refresh, userRaw, remember });

    const init = async () => {
      if (!access || !refresh || !userRaw) {
        console.warn('[Auth] No valid stored session found');
        setLoading(false);
        setReady(true);
        return;
      }

      try {
        const user = JSON.parse(userRaw);
        const role = normalizeRole(user.role);
        if (!user.email || !isValidRole(role)) return logout('invalid_user_data');

        const cleanUser = { ...user, role };
        const { exp } = jwtDecode(access);
        const isExpired = exp * 1000 < Date.now();

        setAuth({ access, refresh, user: cleanUser });

        if (isExpired) {
          console.warn('[Auth] Access token expired. Refreshing...');
          await refreshAccessToken(refresh);
        } else {
          console.log('[Auth] Session is valid');
          scheduleTokenRefresh(access, refresh);
        }
      } catch (err) {
        console.error('[Auth] Failed to initialize session:', err);
        logout('init_session_failed');
      } finally {
        setLoading(false);
        setReady(true);
      }
    };

    init();
  }, [refreshAccessToken, scheduleTokenRefresh, logout]);

  // ------------------------------
  // Expose Context
  // ------------------------------
  const isAuthenticated = !!auth.access && !!auth.user;

  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
        update,
        isAuthenticated,
        loading,
        ready,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => useContext(AuthContext);
