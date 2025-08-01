import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./UpdatePassword.css";

const UpdatePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRequest = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.warn("⚠️ Please fill out all fields.");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("❌ New passwords do not match.");
    }

    if (newPassword.length < 8) {
      return toast.warn("🔐 Password must be at least 8 characters.");
    }

    setLoading(true);
    try {
      await axiosInstance.post("/accounts/profiles/password-update/request/", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      toast.success("✅ Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        (err.response?.data?.new_password && err.response?.data?.new_password[0]) ||
        "❌ Password update failed.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-update">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar theme="colored" />
      <h2>Change Password</h2>

      {/* Current Password */}
      <div className="password-field">
        <input
          type={showCurrent ? "text" : "password"}
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          aria-label="Current Password"
        />
        <button
          type="button"
          className="toggle-btn"
          onClick={() => setShowCurrent((prev) => !prev)}
        >
          {showCurrent ? "🙈" : "👁️"}
        </button>
      </div>

      {/* New Password */}
      <div className="password-field">
        <input
          type={showNew ? "text" : "password"}
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          aria-label="New Password"
        />
        <button
          type="button"
          className="toggle-btn"
          onClick={() => setShowNew((prev) => !prev)}
        >
          {showNew ? "🙈" : "👁️"}
        </button>
      </div>

      {/* Confirm New Password */}
      <div className="password-field">
        <input
          type={showConfirm ? "text" : "password"}
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          aria-label="Confirm New Password"
        />
        <button
          type="button"
          className="toggle-btn"
          onClick={() => setShowConfirm((prev) => !prev)}
        >
          {showConfirm ? "🙈" : "👁️"}
        </button>
      </div>

      <button className="btn" onClick={handleRequest} disabled={loading}>
        {loading ? "Submitting..." : "Submit Request"}
      </button>
    </div>
  );
};

export default UpdatePassword;
