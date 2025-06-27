import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const AUTH_KEYS = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  ROLE: 'role',
  USERNAME: 'username',
};

// Optional: Export logout globally so axiosInstance can call it
let globalLogout = () => {};
export const getGlobalLogout = () => globalLogout;

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    access: localStorage.getItem(AUTH_KEYS.ACCESS),
    refresh: localStorage.getItem(AUTH_KEYS.REFRESH),
    role: localStorage.getItem(AUTH_KEYS.ROLE),
    username: localStorage.getItem(AUTH_KEYS.USERNAME),
  });

  const login = ({ access, refresh, role, username }) => {
    if (!access || !refresh) {
      throw new Error('Login failed: Missing access or refresh token.');
    }

    localStorage.setItem(AUTH_KEYS.ACCESS, access);
    localStorage.setItem(AUTH_KEYS.REFRESH, refresh);
    localStorage.setItem(AUTH_KEYS.ROLE, role);
    localStorage.setItem(AUTH_KEYS.USERNAME, username);

    setAuth({ access, refresh, role, username });
  };

  const logout = () => {
    Object.values(AUTH_KEYS).forEach((key) => localStorage.removeItem(key));
    setAuth({ access: null, refresh: null, role: null, username: null });
  };

  // Make logout available globally
  useEffect(() => {
    globalLogout = logout;
  }, []);

  const update = ({ access, refresh, role, username }) => {
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
      if (role !== undefined) {
        localStorage.setItem(AUTH_KEYS.ROLE, role);
        updated.role = role;
      }
      if (username !== undefined) {
        localStorage.setItem(AUTH_KEYS.USERNAME, username);
        updated.username = username;
      }

      return updated;
    });
  };

  const isAuthenticated = !!auth.access;

  return (
    <AuthContext.Provider value={{ auth, login, logout, update, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
