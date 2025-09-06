// src/context/ProfileContext.js
import { createContext, useContext, useState, useEffect } from "react";
import authAPI from "../../api/authAPI";

// Create Profile Context
const ProfileContext = createContext();

// Provider Component
export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null); // stores user profile
  const [loading, setLoading] = useState(true); // indicates loading state
  const [isAuthenticated, setIsAuthenticated] = useState(false); // authentication status

  // Helper: get stored token
  const getStoredToken = () => {
    try {
      const session = JSON.parse(localStorage.getItem("session")) || {};
      return session.access || null;
    } catch {
      return null;
    }
  };

  // Fetch profile if token exists
  useEffect(() => {
    const fetchProfile = async () => {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        setIsAuthenticated(false);
        setProfile(null);
        return;
      }

      try {
        const res = await authAPI.getProfile();
        setProfile(res?.data ?? null);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setProfile(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Update profile locally
  const updateProfile = (data) => {
    setProfile((prev) => ({ ...prev, ...data }));
  };

  // Clear profile and session on logout
  const clearProfile = () => {
    setProfile(null);
    setIsAuthenticated(false);
    localStorage.removeItem("session");
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        updateProfile,
        clearProfile,
        loading,
        isAuthenticated,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

// Custom hook for consuming profile context
export const useProfile = () => useContext(ProfileContext);
