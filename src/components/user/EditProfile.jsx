// src/components/user/EditProfile.jsx

import React, { useState, useEffect } from "react";
import authAPI from "../../api/authAPI";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useProfile } from "../context/ProfileContext";
import "react-toastify/dist/ReactToastify.css";

// ✅ Use the central PasswordForm styles
import "../../styles/PasswordForm.css";

const EditProfile = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { updateProfile } = useProfile();

  useEffect(() => {
    authAPI
      .getProfile()
      .then((res) => {
        const { first_name, last_name, email, phone_number } = res.data;
        setForm({
          first_name: first_name || "",
          last_name: last_name || "",
          phone_number: phone_number || "",
        });
        setEmail(email || "");
      })
      .catch(() => toast.error("❌ Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const filteredForm = Object.fromEntries(
      Object.entries(form).filter(([_, value]) => value?.trim())
    );

    try {
      const res = await authAPI.updateProfile(filteredForm);

      updateProfile(res.data);

      toast.success("✅ Profile updated successfully!");
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      console.error("[EditProfile] Update failed", err);
      const backendError =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "❌ Failed to update profile.";
      toast.error(backendError);
    }
  };

  if (loading) return <p className="loading-text">Loading profile...</p>;

  return (
    <div className="password-form">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        theme="colored"
      />

      <h2>Edit Your Profile</h2>

      <div className="password-field">
        <input
          type="text"
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          placeholder="First Name"
        />
      </div>

      <div className="password-field">
        <input
          type="text"
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          placeholder="Last Name"
        />
      </div>

      <div className="password-field">
        <input
          type="email"
          value={email}
          readOnly
          placeholder="Email (read-only)"
          style={{ backgroundColor: "#f3f3f3", cursor: "not-allowed" }}
        />
      </div>

      <div className="password-field">
        <input
          type="tel"
          name="phone_number"
          value={form.phone_number}
          onChange={handleChange}
          placeholder="Phone Number"
        />
      </div>

      <div className="button-group">
        <button className="btn" onClick={handleSubmit}>
          Save Changes
        </button>
        <button className="btn danger" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
