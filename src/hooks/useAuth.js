// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { logoutHelper } from "../utils/authUtils";

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load user from storage and validate with backend
  useEffect(() => {
    const storage = localStorage.getItem("remember") === "false" ? sessionStorage : localStorage;
    const accessToken = storage.getItem("access");

    // Preload stored user
    const localUser = storage.getItem("user");
    if (localUser) setUser(JSON.parse(localUser));

    if (!accessToken) {
      setIsLoaded(true);
      return;
    }

    // Fetch profile
    axiosInstance
      .get("/accounts/profile/") // uses axiosInstance baseURL
      .then((res) => {
        setUser(res.data); // must include role
        storage.setItem("user", JSON.stringify(res.data));
      })
      .catch((err) => {
        console.error("🔒 Failed to fetch profile:", err?.response?.data || err.message);
        setUser(null);
        storage.removeItem("user");
        logoutHelper(); // clear invalid tokens
      })
      .finally(() => {
        setIsLoaded(true);
      });
  }, []);

  const login = useCallback(({ access, refresh, user: userData, remember }) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("access", access);
    storage.setItem("refresh", refresh);
    storage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    logoutHelper();
    setUser(null);
  }, []);

  const isAuthenticated = !!user;
  const role = user?.role || null;

  return { user, role, isAuthenticated, isLoaded, login, logout };
};

export default useAuth;
