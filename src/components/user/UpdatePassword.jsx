import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./UpdatePassword.css";

const UpdatePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (!currentPassword || !newPassword) {
      return toast.warn("Please fill out both fields.");
    }

    setLoading(true);
    try {
      await axiosInstance.post("/user-account/profiles/password-update/request/", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("✅ Check your email to confirm the password change.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.response?.data?.error || "❌ Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-update">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar theme="colored" />
      <h2>Change Password</h2>
      <input
        type="password"
        placeholder="Current Password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        required
        aria-label="Current Password"
      />
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        aria-label="New Password"
      />
      <button className="btn" onClick={handleRequest} disabled={loading}>
        {loading ? "Submitting..." : "Submit Request"}
      </button>
    </div>
  );
};

export default UpdatePassword;
