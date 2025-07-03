// src/hooks/useAuth.js
import { useState, useEffect } from "react";

const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        setUser(null);
      }
    }
  }, []);

  const isAuthenticated = !!user;

  return { user, isAuthenticated };
};

export default useAuth;
