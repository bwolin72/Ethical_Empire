import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./EditProfile.css";

const EditProfile = () => {
  const [form, setForm] = useState({ name: "", phone: "" });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get("/accounts/profiles/profile/")
      .then(res => {
        const { name, email, phone } = res.data;
        setForm({ name, phone: phone || "" });
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
      await axiosInstance.put("/accounts/profiles/profile/", form);
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
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Full Name"
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
        name="phone"
        value={form.phone}
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
