// === src/components/user/EditProfile.jsx (Updated) ===
import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./EditProfile.css";

const EditProfile = () => {
  const [form, setForm] = useState({ username: "", email: "", phone_number: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get("/user-account/profiles/profile/")
      .then(res => {
        const { username, email, phone_number } = res.data;
        setForm({ username, email: email || "", phone_number: phone_number || "" });
      })
      .catch(() => toast.error("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    try {
      await axiosInstance.put("/user-account/profiles/profile/", form);
      toast.success("✅ Profile updated successfully!");
    } catch {
      toast.error("❌ Failed to update profile.");
    }
  };

  if (loading) return <p className="loading-text">Loading profile...</p>;

  return (
    <div className="edit-profile">
      <h2>Edit Your Profile</h2>
      <input
        type="text"
        value={form.username}
        onChange={e => setForm({ ...form, username: e.target.value })}
        placeholder="Username"
      />
      <input
        type="email"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
        placeholder="Email"
      />
      <input
        type="tel"
        value={form.phone_number}
        onChange={e => setForm({ ...form, phone_number: e.target.value })}
        placeholder="Phone Number"
      />
      <button className="btn" onClick={handleSubmit}>Save Changes</button>
    </div>
  );
};

export default EditProfile;
