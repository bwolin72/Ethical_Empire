// src/components/context/AuthContext.js

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../../api/axiosInstance';

const AuthContext = createContext();

const AUTH_KEYS = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  USER: 'user',
};

let refreshTimer = null;

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    access: null,
    refresh: null,
    user: null,
  });

  const [loading, setLoading] = useState(true);

  const clearSession = () => {
    clearTimeout(refreshTimer);
    localStorage.removeItem(AUTH_KEYS.ACCESS);
    localStorage.removeItem(AUTH_KEYS.REFRESH);
    localStorage.removeItem(AUTH_KEYS.USER);
  };

  const logout = useCallback(() => {
    clearSession();
    setAuth({ access: null, refresh: null, user: null });
    window.location.href = '/login';
  }, []);

  const refreshAccessToken = useCallback(
    async (refreshToken, reSchedule) => {
      if (!refreshToken) return logout();

      try {
        const { data } = await axiosInstance.post('/accounts/token/refresh/', {
          refresh: refreshToken,
        });

        const newAccess = data.access;
        if (!newAccess) throw new Error('No access token returned');

        localStorage.setItem(AUTH_KEYS.ACCESS, newAccess);

        setAuth((prev) => ({
          ...prev,
          access: newAccess,
        }));

        reSchedule(newAccess, refreshToken);
      } catch (err) {
        console.error('Failed to refresh token:', err);
        logout();
      }
    },
    [logout]
  );

  const scheduleTokenRefresh = useCallback(
    (accessToken, refreshToken) => {
      try {
        const decoded = jwtDecode(accessToken);
        const exp = decoded.exp * 1000;
        const now = Date.now();
        const buffer = 60 * 1000; // 1 minute early
        const delay = exp - now - buffer;

        if (delay <= 0) {
          refreshAccessToken(refreshToken, scheduleTokenRefresh);
        } else {
          clearTimeout(refreshTimer);
          refreshTimer = setTimeout(() => {
            refreshAccessToken(refreshToken, scheduleTokenRefresh);
          }, delay);
        }
      } catch (err) {
        console.error('Invalid access token:', err);
        logout();
      }
    },
    [refreshAccessToken, logout]
  );

  const login = useCallback(
    ({ access, refresh, user }) => {
      if (!access || !refresh || !user) {
        console.error('Missing login data');
        return logout();
      }

      localStorage.setItem(AUTH_KEYS.ACCESS, access);
      localStorage.setItem(AUTH_KEYS.REFRESH, refresh);
      localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));

      setAuth({ access, refresh, user });
      scheduleTokenRefresh(access, refresh);
    },
    [logout, scheduleTokenRefresh]
  );

  const update = useCallback(({ access, refresh, user }) => {
    setAuth((prev) => {
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

    if (access && refresh && userRaw) {
      try {
        const user = JSON.parse(userRaw);
        setAuth({ access, refresh, user });
        scheduleTokenRefresh(access, refresh);
      } catch (err) {
        console.error('Invalid user data in storage');
        logout();
      }
    }

    setLoading(false);
  }, [scheduleTokenRefresh, logout]);

  const isAuthenticated = !!auth.access;

  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
        update,
        isAuthenticated,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
