import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./EditProfile.css";

const EditProfile = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance
      .get("/accounts/profiles/profile/")
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
    // Remove empty or whitespace-only fields before sending
    const filteredForm = Object.fromEntries(
      Object.entries(form).filter(([_, value]) => value?.trim())
    );

    try {
      await axiosInstance.patch("/accounts/profiles/profile/", filteredForm);
      toast.success("✅ Profile updated successfully!");
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      console.error("[EditProfile] Update failed", err);
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
        name="first_name"
        value={form.first_name}
        onChange={handleChange}
        placeholder="First Name"
      />

      <input
        type="text"
        name="last_name"
        value={form.last_name}
        onChange={handleChange}
        placeholder="Last Name"
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
