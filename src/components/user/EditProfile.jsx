// src/components/user/EditProfile.jsx

import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./EditProfile.css";

const EditProfile = () => {
  const [form, setForm] = useState({ username: "", phone_number: "" });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get("/api/accounts/profiles/profile/")
      .then(res => {
        const { username, email, phone_number } = res.data;
        setForm({ username, phone_number: phone_number || "" });
        setEmail(email || "");
      })
      .catch(() => toast.error("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axiosInstance.put("/api/accounts/profiles/profile/", form);
      toast.success("✅ Profile updated successfully!");
      setTimeout(() => navigate(-1), 1000); // redirect after toast
    } catch {
      toast.error("❌ Failed to update profile.");
    }
  };

  if (loading) return <p className="loading-text">Loading profile...</p>;

  return (
    <div className="edit-profile">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar theme="colored" />
      <h2>Edit Your Profile</h2>

      <input
        type="text"
        name="username"
        value={form.username}
        onChange={handleChange}
        placeholder="Username"
      />

      <input
        type="email"
        value={email}
        readOnly
        placeholder="Email (read-only)"
        style={{ backgroundColor: "#f3f3f3", cursor: "not-allowed" }}
      />

      <input
        type="tel"
        name="phone_number"
        value={form.phone_number}
        onChange={handleChange}
        placeholder="Phone Number"
      />

      <div className="button-group">
        <button className="btn" onClick={handleSubmit}>Save Changes</button>
        <button className="btn danger" onClick={() => navigate(-1)}>Cancel</button>
      </div>
    </div>
  );
};

export default EditProfile;
