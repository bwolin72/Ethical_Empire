// src/components/context/AuthContext.js
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

const AuthContext = createContext();

const AUTH_KEYS = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  USER: 'user',
  REMEMBER: 'remember',
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const refreshTimer = useRef(null);
  const refreshAccessTokenRef = useRef(null);

  const [auth, setAuth] = useState({ access: null, refresh: null, user: null });
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  const clearSession = () => {
    console.warn('[Auth] Clearing session storage and timers');
    clearTimeout(refreshTimer.current);
    Object.values(AUTH_KEYS).forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  };

  const logout = useCallback((reason = 'manual') => {
    console.warn(`[Auth] Logging out. Reason: ${reason}`);
    clearSession();
    setAuth({ access: null, refresh: null, user: null });
    setReady(true);
    navigate('/login', { replace: true });
  }, [navigate]);

  const scheduleTokenRefresh = useCallback((accessToken, refreshToken) => {
    try {
      const decoded = jwtDecode(accessToken);
      const exp = decoded.exp * 1000;
      const now = Date.now();
      const delay = exp - now - 60000;

      console.log('[Auth] Scheduling token refresh in', delay / 1000, 'seconds');

      if (delay <= 0) {
        console.warn('[Auth] Token expired or too close. Refreshing immediately.');
        refreshAccessTokenRef.current?.(refreshToken);
      } else {
        clearTimeout(refreshTimer.current);
        refreshTimer.current = setTimeout(() => {
          refreshAccessTokenRef.current?.(refreshToken);
        }, delay);
      }
    } catch (err) {
      console.error('[Auth] scheduleTokenRefresh error', err);
      logout('token_decode_failed');
    }
  }, [logout]);

  const refreshAccessToken = useCallback(async (refreshToken) => {
    if (!refreshToken) {
      console.warn('[Auth] No refresh token. Logging out.');
      return logout('missing_refresh_token');
    }

    try {
      console.log('[Auth] Attempting token refresh...');
      const refreshUrl = process.env.REACT_APP_API_REFRESH_URL || '/accounts/token/refresh/';
      const { data } = await axiosInstance.post(refreshUrl, { refresh: refreshToken });

      const newAccess = data.access;
      if (!newAccess) throw new Error('No access token returned');

      const remember = localStorage.getItem(AUTH_KEYS.REMEMBER) === 'true';
      const storage = remember ? localStorage : sessionStorage;

      storage.setItem(AUTH_KEYS.ACCESS, newAccess);
      console.log('[Auth] Token refresh succeeded.');
      setAuth((prev) => ({ ...prev, access: newAccess }));
      scheduleTokenRefresh(newAccess, refreshToken);
    } catch (err) {
      console.error('[Auth] Token refresh failed:', err);
      toast.error('Session expired, please log in again.');
      logout('refresh_failed');
    }
  }, [logout, scheduleTokenRefresh]);

  useEffect(() => {
    refreshAccessTokenRef.current = refreshAccessToken;
  }, [refreshAccessToken]);

  const login = useCallback(({ access, refresh, user, remember = true }) => {
    if (!access || !refresh || !user) {
      console.error('[Auth] Invalid login payload:', { access, refresh, user });
      return logout('invalid_login_data');
    }

    const storage = remember ? localStorage : sessionStorage;
    localStorage.setItem(AUTH_KEYS.REMEMBER, remember ? 'true' : 'false');
    storage.setItem(AUTH_KEYS.ACCESS, access);
    storage.setItem(AUTH_KEYS.REFRESH, refresh);
    storage.setItem(AUTH_KEYS.USER, JSON.stringify(user));

    console.log('[Auth] Logged in:', user);
    setAuth({ access, refresh, user });
    setReady(true);
    scheduleTokenRefresh(access, refresh);
  }, [logout, scheduleTokenRefresh]);

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
        storage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
        updated.user = user;
      }
      return updated;
    });
  }, []);

  useEffect(() => {
    const rememberStored = localStorage.getItem(AUTH_KEYS.REMEMBER);
    const remember = rememberStored === null ? true : rememberStored === 'true';
    const storage = remember ? localStorage : sessionStorage;

    const access = storage.getItem(AUTH_KEYS.ACCESS);
    const refresh = storage.getItem(AUTH_KEYS.REFRESH);
    const userRaw = storage.getItem(AUTH_KEYS.USER);

    console.log('[Auth] Initializing session from storage...');
    console.log('[Auth] Storage:', { access, refresh, userRaw, remember });

    const tryInitialize = async () => {
      if (!access || !refresh || !userRaw) {
        console.warn('[Auth] No valid stored session found');
        setLoading(false);
        setReady(true);
        return;
      }

      try {
        const decoded = jwtDecode(access);
        const isExpired = decoded.exp * 1000 < Date.now();
        const user = JSON.parse(userRaw);

        if (!user?.email || !user?.role) {
          console.warn('[Auth] Invalid stored user data');
          return logout('invalid_user_data');
        }

        setAuth({ access, refresh, user });

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

    tryInitialize();
  }, [refreshAccessToken, scheduleTokenRefresh, logout]);

  const isAuthenticated = !!auth?.access && !!auth?.user;

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

export const useAuth = () => useContext(AuthContext);
