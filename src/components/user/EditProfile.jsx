import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import "./EditProfile.css";

const EditProfile = () => {
  const [form, setForm] = useState({ username: "", email: "", phone_number: "" });

  useEffect(() => {
    axiosInstance.get("/api/profiles/profile/").then(res => {
      const { username, email, phone_number } = res.data;
      setForm({ username, email: email || "", phone_number: phone_number || "" });
    });
  }, []);

  const handleSubmit = async () => {
    try {
      await axiosInstance.put("/api/profiles/profile/", form);
      alert("Profile updated");
    } catch {
      alert("Update failed");
    }
  };

  return (
    <div className="edit-profile">
      <h2>Edit Profile</h2>
      <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Username" />
      <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" />
      <input value={form.phone_number} onChange={e => setForm({ ...form, number: e.target.value })} placeholder="Phone" />
      <button onClick={handleSubmit}>Save</button>
    </div>
  );
};

export default EditProfile;
