import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

const AUTH_KEYS = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  USER: 'user',
};

let globalLogout = () => {};
export const getGlobalLogout = () => globalLogout;

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    access: null,
    refresh: null,
    user: null,
  });

  const [loading, setLoading] = useState(true);

  // Load auth from localStorage on initial mount
  useEffect(() => {
    const access = localStorage.getItem(AUTH_KEYS.ACCESS);
    const refresh = localStorage.getItem(AUTH_KEYS.REFRESH);
    const userRaw = localStorage.getItem(AUTH_KEYS.USER);
    const user = userRaw ? JSON.parse(userRaw) : null;

    if (access && refresh && user) {
      setAuth({ access, refresh, user });
    }

    setLoading(false);
  }, []);

  const login = ({ access, refresh, user }) => {
    if (!access || !refresh || !user) {
      throw new Error('Login failed: Missing access, refresh token, or user.');
    }

    localStorage.setItem(AUTH_KEYS.ACCESS, access);
    localStorage.setItem(AUTH_KEYS.REFRESH, refresh);
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));

    setAuth({ access, refresh, user });
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEYS.ACCESS);
    localStorage.removeItem(AUTH_KEYS.REFRESH);
    localStorage.removeItem(AUTH_KEYS.USER);
    setAuth({ access: null, refresh: null, user: null });
  };

  const update = ({ access, refresh, user }) => {
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
  };

  useEffect(() => {
    globalLogout = logout;
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
        loading, // ✅ Expose loading flag
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
