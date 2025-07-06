import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../../api/axiosInstance';

const AuthContext = createContext();

const AUTH_KEYS = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  USER: 'user',
};

let refreshTimer = null;
let globalLogout = null; // Global logout reference

export const getGlobalLogout = () => globalLogout;

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    access: null,
    refresh: null,
    user: null,
  });
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearTimeout(refreshTimer);
    localStorage.removeItem(AUTH_KEYS.ACCESS);
    localStorage.removeItem(AUTH_KEYS.REFRESH);
    localStorage.removeItem(AUTH_KEYS.USER);
    setAuth({ access: null, refresh: null, user: null });
  }, []);

  globalLogout = logout; // Allow external access to logout

  const refreshAccessToken = useCallback(async (refreshToken) => {
    if (!refreshToken) return logout();

    try {
      const { data } = await axiosInstance.post('/accounts/token/refresh/', {
        refresh: refreshToken,
      });

      const newAccess = data.access;
      localStorage.setItem(AUTH_KEYS.ACCESS, newAccess);

      setAuth((prev) => ({
        ...prev,
        access: newAccess,
      }));

      scheduleTokenRefresh(newAccess, refreshToken);
    } catch (err) {
      console.error('Token refresh failed:', err);
      logout();
    }
  }, [logout]);

  const scheduleTokenRefresh = useCallback((accessToken, refreshToken) => {
    try {
      const decoded = jwtDecode(accessToken);
      const expTime = decoded.exp * 1000;
      const now = Date.now();
      const buffer = 60 * 1000;
      const timeout = expTime - now - buffer;

      if (timeout <= 0) {
        console.warn('Access token expired or expiring soon. Refreshing now...');
        refreshAccessToken(refreshToken);
        return;
      }

      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        refreshAccessToken(refreshToken);
      }, timeout);
    } catch (err) {
      console.error('Error decoding token:', err);
    }
  }, [refreshAccessToken]);

  useEffect(() => {
    const access = localStorage.getItem(AUTH_KEYS.ACCESS);
    const refresh = localStorage.getItem(AUTH_KEYS.REFRESH);
    const userRaw = localStorage.getItem(AUTH_KEYS.USER);
    const user = userRaw ? JSON.parse(userRaw) : null;

    if (access && refresh && user) {
      setAuth({ access, refresh, user });
      scheduleTokenRefresh(access, refresh);
    }

    setLoading(false);
  }, [scheduleTokenRefresh]);

  const login = useCallback(({ access, refresh, user }) => {
    localStorage.setItem(AUTH_KEYS.ACCESS, access);
    localStorage.setItem(AUTH_KEYS.REFRESH, refresh);
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));

    setAuth({ access, refresh, user });
    scheduleTokenRefresh(access, refresh);
  }, [scheduleTokenRefresh]);

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
