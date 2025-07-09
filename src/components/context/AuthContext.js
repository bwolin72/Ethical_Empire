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

const AuthContext = createContext();

const AUTH_KEYS = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  USER: 'user',
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const refreshTimer = useRef(null);
  const refreshAccessTokenRef = useRef(null);

  const [auth, setAuth] = useState({
    access: null,
    refresh: null,
    user: null,
  });

  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false); // NEW: Ensures session check done

  const clearSession = () => {
    clearTimeout(refreshTimer.current);
    Object.values(AUTH_KEYS).forEach(key => localStorage.removeItem(key));
  };

  const logout = useCallback(() => {
    clearSession();
    setAuth({ access: null, refresh: null, user: null });
    navigate('/login', { replace: true });
  }, [navigate]);

  const scheduleTokenRefresh = useCallback((accessToken, refreshToken) => {
    try {
      const decoded = jwtDecode(accessToken);
      const exp = decoded.exp * 1000;
      const now = Date.now();
      const delay = exp - now - 60000;

      if (delay <= 0) {
        refreshAccessTokenRef.current?.(refreshToken);
      } else {
        clearTimeout(refreshTimer.current);
        refreshTimer.current = setTimeout(() => {
          refreshAccessTokenRef.current?.(refreshToken);
        }, delay);
      }
    } catch (err) {
      console.error('Token scheduling failed:', err);
      logout();
    }
  }, [logout]);

  const refreshAccessToken = useCallback(async (refreshToken) => {
    if (!refreshToken) return logout();

    try {
      const refreshUrl = process.env.REACT_APP_API_REFRESH_URL || '/accounts/token/refresh/';
      const { data } = await axiosInstance.post(refreshUrl, { refresh: refreshToken });

      const newAccess = data.access;
      if (!newAccess) throw new Error('No access token returned');

      localStorage.setItem(AUTH_KEYS.ACCESS, newAccess);
      setAuth(prev => ({ ...prev, access: newAccess }));
      scheduleTokenRefresh(newAccess, refreshToken);
    } catch (err) {
      console.error('Failed to refresh token:', err);
      logout();
    }
  }, [logout, scheduleTokenRefresh]);

  refreshAccessTokenRef.current = refreshAccessToken;

  const login = useCallback(({ access, refresh, user }) => {
    if (!access || !refresh || !user) {
      console.error('Login data incomplete');
      return logout();
    }

    localStorage.setItem(AUTH_KEYS.ACCESS, access);
    localStorage.setItem(AUTH_KEYS.REFRESH, refresh);
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));

    setAuth({ access, refresh, user });
    scheduleTokenRefresh(access, refresh);
  }, [logout, scheduleTokenRefresh]);

  const update = useCallback(({ access, refresh, user }) => {
    setAuth(prev => {
      const updated = { ...prev };
      if (access !== undefined) {
        localStorage.setItem(AUTH_KEYS.ACCESS, access);
        updated.access = access;
      }
      if (refresh !== undefined) {
        localStorage.setItem(AUTH_KEYS.REFRESH, refresh);
        updated.refresh = refresh;
      }
      if (user !== undefined) {
        localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
        updated.user = user;
      }
      return updated;
    });
  }, []);

  useEffect(() => {
    const access = localStorage.getItem(AUTH_KEYS.ACCESS);
    const refresh = localStorage.getItem(AUTH_KEYS.REFRESH);
    const userRaw = localStorage.getItem(AUTH_KEYS.USER);

    const tryInitializeSession = async () => {
      if (!access || !refresh || !userRaw) {
        setLoading(false);
        setReady(true);
        return;
      }

      try {
        const decoded = jwtDecode(access);
        const isExpired = decoded.exp * 1000 < Date.now();
        const user = JSON.parse(userRaw);

        setAuth({ access, refresh, user });

        if (isExpired) {
          await refreshAccessToken(refresh);
        } else {
          scheduleTokenRefresh(access, refresh);
        }
      } catch (err) {
        console.error('Session init failed:', err);
        logout();
      } finally {
        setLoading(false);
        setReady(true); // ✅ Set ready once complete
      }
    };

    tryInitializeSession();
  }, [refreshAccessToken, scheduleTokenRefresh, logout]);

  const isAuthenticated = !!auth?.access && !!auth?.user;

  return (
    <AuthContext.Provider value={{ auth, login, logout, update, isAuthenticated, loading, ready }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
