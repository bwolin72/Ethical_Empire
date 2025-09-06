// src/components/user/ConfirmPasswordChange.jsx

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import authAPI from "../../api/authAPI";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ Use the central PasswordForm styles
import "../styles/PasswordForm.css";

const ConfirmPasswordChange = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const uidb64 = params.get("uid");
  const token = params.get("token");

  useEffect(() => {
    if (!uidb64 || !token) {
      toast.error("❌ Missing reset credentials.");
      navigate("/reset-password");
    }
  }, [uidb64, token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      return toast.warn("⚠️ Please fill in both fields.");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("❌ Passwords do not match.");
    }

    if (newPassword.length < 8) {
      return toast.warn("🔐 Password must be at least 8 characters.");
    }

    setLoading(true);
    try {
      await authAPI.resetPasswordConfirm(uidb64, token, {
        new_password: newPassword,
      });

      toast.success("✅ Password has been reset. Redirecting...");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      console.error("[ConfirmPasswordChange] Error:", err);
      const backendError =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "❌ Invalid or expired reset link.";
      toast.error(backendError);
      setTimeout(() => navigate("/reset-password"), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-form">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        theme="colored"
      />

      <h2>Set a New Password</h2>

      <form onSubmit={handleSubmit}>
        <div className="password-field">
          <input
            type="password"
            placeholder="Enter New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            aria-label="New Password"
          />
        </div>

        <div className="password-field">
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            aria-label="Confirm New Password"
          />
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Submitting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ConfirmPasswordChange;
