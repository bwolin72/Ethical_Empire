import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

const AUTH_KEYS = {
  TOKEN: 'token',
  USER: 'user', // Can store JSON stringified object
};

// Optional: export logout globally
let globalLogout = () => {};
export const getGlobalLogout = () => globalLogout;

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem(AUTH_KEYS.TOKEN);
    const user = localStorage.getItem(AUTH_KEYS.USER);
    return token && user
      ? { token, user: JSON.parse(user) }
      : { token: null, user: null };
  });

  const login = ({ token, user }) => {
    if (!token || !user) {
      throw new Error('Login failed: Missing token or user.');
    }

    localStorage.setItem(AUTH_KEYS.TOKEN, token);
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));

    setAuth({ token, user });
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEYS.TOKEN);
    localStorage.removeItem(AUTH_KEYS.USER);
    setAuth({ token: null, user: null });
  };

  useEffect(() => {
    globalLogout = logout;
  }, []);

  const update = ({ token, user }) => {
    setAuth((prev) => {
      const updated = { ...prev };

      if (token !== undefined) {
        localStorage.setItem(AUTH_KEYS.TOKEN, token);
        updated.token = token;
      }

      if (user !== undefined) {
        localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
        updated.user = user;
      }

      return updated;
    });
  };

  const isAuthenticated = !!auth.token;

  return (
    <AuthContext.Provider value={{ auth, login, logout, update, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
