// src/hooks/useAuth.js
import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "https://ethical-backend-production.up.railway.app";

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("access");

    // If user is already in localStorage, preload it
    const localUser = localStorage.getItem("user");
    if (localUser) {
      setUser(JSON.parse(localUser));
    }

    // Fetch user profile with valid access token
    if (accessToken) {
      axios
        .get(`${API_BASE}/api/accounts/profile/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          setUser(res.data); // Should include `role`
          localStorage.setItem("user", JSON.stringify(res.data));
        })
        .catch((err) => {
          console.error("🔒 Failed to fetch user profile:", err?.response?.data || err.message);
          setUser(null);
          localStorage.removeItem("user");
        })
        .finally(() => {
          setIsLoaded(true);
        });
    } else {
      setIsLoaded(true);
    }
  }, []);

  const isAuthenticated = !!user;
  const role = user?.role || null;

  return { user, role, isAuthenticated, isLoaded };
};

export default useAuth;
