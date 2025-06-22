import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

const AUTH_KEYS = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  ROLE: 'role',
  USERNAME: 'username',
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    access: localStorage.getItem(AUTH_KEYS.ACCESS) || null,
    refresh: localStorage.getItem(AUTH_KEYS.REFRESH) || null,
    role: localStorage.getItem(AUTH_KEYS.ROLE) || null, // 'admin', 'user', 'worker'
    username: localStorage.getItem(AUTH_KEYS.USERNAME) || null,
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
    Object.values(AUTH_KEYS).forEach(key => localStorage.removeItem(key));
    setAuth({ access: null, refresh: null, role: null, username: null });
  };

  const update = ({ access, refresh, role, username }) => {
    if (access !== undefined) {
      localStorage.setItem(AUTH_KEYS.ACCESS, access);
      setAuth(prev => ({ ...prev, access }));
    }
    if (refresh !== undefined) {
      localStorage.setItem(AUTH_KEYS.REFRESH, refresh);
      setAuth(prev => ({ ...prev, refresh }));
    }
    if (role !== undefined) {
      localStorage.setItem(AUTH_KEYS.ROLE, role);
      setAuth(prev => ({ ...prev, role }));
    }
    if (username !== undefined) {
      localStorage.setItem(AUTH_KEYS.USERNAME, username);
      setAuth(prev => ({ ...prev, username }));
    }
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, update }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
