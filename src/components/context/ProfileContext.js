// src/context/ProfileContext.js
import { createContext, useContext, useState, useEffect } from "react";
import authAPI from "../../api/authAPI";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fixed: call the correct method from authAPI
        const res = await authAPI.getProfile();
        setProfile(res?.data ?? null);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setProfile(null); // ensure profile is null on error
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const updateProfile = (data) => {
    setProfile((prev) => ({ ...prev, ...data }));
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
