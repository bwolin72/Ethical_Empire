// AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import jwt_decode from "jwt-decode";

const AuthContext = createContext();
export { AuthContext };

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [auth, setAuth] = useState({ user: null, access: null, refresh: null });
  const [ready, setReady] = useState(false);

  const isAuthenticated = !!auth?.user;

  // Safe storage helpers
  const getStorage = () => {
    const remember = localStorage.getItem("remember") === "true";
    return remember ? localStorage : sessionStorage;
  };

  const loadFromStorage = () => {
    try {
      const storage = getStorage();
      const user = JSON.parse(storage.getItem("user") || "null");
      const access = storage.getItem("access");
      const refresh = storage.getItem("refresh");
      return { user, access, refresh };
    } catch {
      return { user: null, access: null, refresh: null };
    }
  };

  // Initialize auth from storage
  useEffect(() => {
    const { user, access, refresh } = loadFromStorage();

    if (access && user) {
      try {
        const { exp } = jwt_decode(access);
        const expired = exp * 1000 < Date.now();
        if (!expired) {
          setAuth({ user, access, refresh });
        }
      } catch {
        console.warn("Invalid token, clearing auth.");
      }
    }
    setReady(true); // 🔑 only mark ready after storage check
  }, []);

  // Login
  const login = useCallback(({ user, access, refresh }) => {
    setAuth({ user, access, refresh });
    const storage = getStorage();
    storage.setItem("user", JSON.stringify(user));
    storage.setItem("access", access);
    storage.setItem("refresh", refresh);
  }, []);

  // Logout
  const logout = useCallback(() => {
    setAuth({ user: null, access: null, refresh: null });
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ auth, login, logout, isAuthenticated, ready }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
