// src/components/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import jwt_decode from "jwt-decode";

// ✅ Create the AuthContext (named export)
export const AuthContext = createContext();

// ✅ Provider component
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const refreshTimer = useRef(null);

  const [auth, setAuth] = useState({ user: null, access: null, refresh: null });
  const [ready, setReady] = useState(false);

  const isAuthenticated = !!auth?.user;

  // ----------------------------
  // Storage helpers
  // ----------------------------
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

  // ----------------------------
  // Initialize from storage
  // ----------------------------
  useEffect(() => {
    const { user, access, refresh } = loadFromStorage();
    if (user && access) {
      try {
        const { exp } = jwt_decode(access);
        const expired = exp * 1000 < Date.now();
        if (!expired) setAuth({ user, access, refresh });
      } catch {
        console.warn("Invalid token, clearing auth.");
      }
    }
    setReady(true);
  }, []);

  // ----------------------------
  // Login
  // ----------------------------
  const login = useCallback(({ user, access, refresh, remember = true }) => {
    setAuth({ user, access, refresh });
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("user", JSON.stringify(user));
    storage.setItem("access", access);
    storage.setItem("refresh", refresh);
    localStorage.setItem("remember", remember ? "true" : "false");
  }, []);

  // ----------------------------
  // Logout
  // ----------------------------
  const logout = useCallback(() => {
    setAuth({ user: null, access: null, refresh: null });
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login", { replace: true });
  }, [navigate]);

  // ----------------------------
  // Google OAuth login
  // ----------------------------
  const loginWithGoogle = useCallback(
    async (googleToken, remember = true) => {
      if (!googleToken) throw new Error("Missing Google token");
      try {
        const { data } = await axiosInstance.post("/accounts/google-login/", { token: googleToken });
        const { access, refresh, user } = data;
        if (!access || !refresh || !user) throw new Error("Invalid Google login response");
        login({ access, refresh, user, remember });
        return user;
      } catch (err) {
        console.error("[Auth] Google login failed:", err);
        throw err;
      }
    },
    [login]
  );

  return (
    <AuthContext.Provider
      value={{ auth, login, logout, loginWithGoogle, isAuthenticated, ready }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ----------------------------
// Custom hook for consuming AuthContext
// ----------------------------
export const useAuth = () => useContext(AuthContext);
