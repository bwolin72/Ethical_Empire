import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    access: localStorage.getItem('access') || null,
    refresh: localStorage.getItem('refresh') || null,
    isAdmin: localStorage.getItem('isAdmin') === 'true',
    username: localStorage.getItem('username') || null,
  });

  const login = ({ access, refresh, isAdmin, username }) => {
    if (!access || !refresh) {
      throw new Error('Login failed: Access and refresh tokens are required.');
    }
    console.log('AuthContext login called with:', { access, refresh, isAdmin, username });
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    localStorage.setItem('isAdmin', isAdmin.toString());  // Convert boolean to string
    localStorage.setItem('username', username);
    setAuth({ access, refresh, isAdmin, username });
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('username');
    setAuth({ access: null, refresh: null, isAdmin: false, username: null });
  };

  const update = ({ access, refresh, isAdmin, username }) => {
    if (access !== undefined) {
      localStorage.setItem('access', access);
      setAuth(prev => ({ ...prev, access }));
    }
    if (refresh !== undefined) {
      localStorage.setItem('refresh', refresh);
      setAuth(prev => ({ ...prev, refresh }));
    }
    if (isAdmin !== undefined) {
      localStorage.setItem('isAdmin', isAdmin.toString());  // Convert boolean to string
      setAuth(prev => ({ ...prev, isAdmin }));
    }
    if (username !== undefined) {
      localStorage.setItem('username', username);
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
