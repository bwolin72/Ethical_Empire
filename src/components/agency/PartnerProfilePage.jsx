// src/components/partner/PartnerProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService"; // ✅ centralized API
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FadeInSection from "../FadeInSection";
import "./PartnerProfilePage.css";

const PartnerProfilePage = () => {
  const [profile, setProfile] = useState({
    company_name: "",
    business_type: "",
    phone: "",
    country: "",
    website: "",
    message: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );

  const navigate = useNavigate();

  // ✅ Fetch partner profile on mount
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchProfile = async () => {
      try {
        const res = await apiService.partner?.getProfile?.({ signal });
        if (res?.data) {
          setProfile((prev) => ({ ...prev, ...res.data }));
          if (res.data.image) setImagePreview(res.data.image);
        }
      } catch (err) {
        if (err?.name !== "CanceledError") {
          console.error("Profile fetch error:", err);
          toast.error("Failed to fetch profile");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    return () => controller.abort();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(profile).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    try {
      await apiService.partner?.updateProfile?.(formData);
      toast.success("Profile updated successfully");
      navigate("/partner-dashboard");
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error("Failed to update profile");
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  return (
    <div className={`partner-profile-page ${darkMode ? "dark" : ""}`}>
      <ToastContainer position="top-center" autoClose={3000} theme="colored" />
      
      <header className="partner-header">
        <h2>Partner Profile</h2>
        <button
          onClick={toggleDarkMode}
          className="dark-toggle"
          aria-label="Toggle dark mode"
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </header>

      {loading ? (
        <p className="loading-text">Loading profile...</p>
      ) : (
        <FadeInSection>
          <form onSubmit={handleSubmit} className="partner-form">
            <label>
              Company Name
              <input
                name="company_name"
                value={profile.company_name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Business Type
              <input
                name="business_type"
                value={profile.business_type}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Phone Number
              <input
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Country
              <input
                name="country"
                value={profile.country}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Website / Portfolio
              <input
                name="website"
                value={profile.website}
                onChange={handleChange}
              />
            </label>

            <label>
              Message / Equipment Needed
              <textarea
                name="message"
                value={profile.message}
                onChange={handleChange}
                rows="4"
                required
              />
            </label>

            <label>
              Upload Image (optional)
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="image-preview"
                />
              )}
            </label>

            <button type="submit" className="submit-btn">
              Update Profile
            </button>
          </form>
        </FadeInSection>
      )}
    </div>
  );
};

export default PartnerProfilePage;
