// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { logoutHelper, clearSession } from "../utils/authUtils";

/**
 * 🔒 useAuth Hook
 * Handles authentication state, login, logout, and role info.
 */
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Helper: determine which storage to use
  const getStorage = (remember) => {
    if (remember === false || localStorage.getItem("remember") === "false") {
      return sessionStorage;
    }
    return localStorage;
  };

  // ==============================
  // Load user on mount
  // ==============================
  useEffect(() => {
    const storage = getStorage(true); // default to localStorage
    const accessToken = storage.getItem("access");

    // Preload stored user if available
    const localUser = storage.getItem("user");
    if (localUser) setUser(JSON.parse(localUser));

    if (!accessToken) {
      setIsLoaded(true);
      return; // guest mode
    }

    // Fetch profile from API to ensure token is valid
    axiosInstance
      .get("/accounts/profile/")
      .then((res) => {
        setUser(res.data);
        storage.setItem("user", JSON.stringify(res.data));
      })
      .catch((err) => {
        console.error(
          "🔒 Failed to fetch profile:",
          err?.response?.data || err.message
        );
        clearSession();
        setUser(null);
        storage.removeItem("user");
      })
      .finally(() => {
        setIsLoaded(true);
      });
  }, []);

  // ==============================
  // Login
  // ==============================
  const login = useCallback(
    ({ access, refresh, user: userData, remember }) => {
      const storage = getStorage(remember);
      storage.setItem("access", access);
      storage.setItem("refresh", refresh);
      storage.setItem("user", JSON.stringify(userData));
      storage.setItem("remember", remember ? "true" : "false");
      setUser(userData);
    },
    []
  );

  // ==============================
  // Logout
  // ==============================
  const logout = useCallback(() => {
    clearSession(); // remove all tokens & user data
    setUser(null);
  }, []);

  // ==============================
  // Derived state
  // ==============================
  const isAuthenticated = !!user;
  const role = user?.role || null;

  return { user, role, isAuthenticated, isLoaded, login, logout };
};

export default useAuth;
