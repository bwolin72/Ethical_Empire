// src/components/user/EditProfile.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useProfile } from "../context/ProfileContext";
import "react-toastify/dist/ReactToastify.css";
import "./EditProfile.css"; // 🎨 your custom CSS theme

const EditProfile = () => {
  const navigate = useNavigate();
  const { updateProfile } = useProfile();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // === Load user profile ===
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/accounts/profile/");
        const { first_name, last_name, email, phone_number } = res.data;
        setForm({
          first_name: first_name || "",
          last_name: last_name || "",
          phone_number: phone_number || "",
        });
        setEmail(email || "");
      } catch (err) {
        console.error("❌ Failed to fetch profile", err);
        toast.error("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // === Handle changes ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // === Handle submit ===
  const handleSubmit = async () => {
    const filteredForm = Object.fromEntries(
      Object.entries(form).filter(([_, v]) => v?.trim())
    );

    try {
      const res = await axiosInstance.put("/accounts/profile/", filteredForm);
      updateProfile(res.data);
      toast.success("✅ Profile updated successfully!");
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      console.error("❌ Update failed:", err);
      const backendError =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Failed to update profile. Please try again.";
      toast.error(backendError);
    }
  };

  // === Render ===
  if (loading)
    return (
      <p className="edit-profile__loading">
        Loading your profile...
      </p>
    );

  return (
    <div className="edit-profile">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar theme="colored" />

      <div className="edit-profile__card">
        <h2 className="edit-profile__title">Edit Your Profile</h2>
        <p className="edit-profile__subtitle">
          Keep your information accurate and up-to-date
        </p>

        <div className="edit-profile__form">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="Enter your first name"
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Enter your last name"
            />
          </div>

          <div className="form-group">
            <label>Email (read-only)</label>
            <input
              type="email"
              value={email}
              readOnly
              className="readonly"
              placeholder="Your email address"
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="button-row">
            <button className="btn-primary" onClick={handleSubmit}>
              Save Changes
            </button>
            <button className="btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
