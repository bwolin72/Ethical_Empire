// src/pages/auth/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "./Auth.css";

import authService from "../../api/services/authService";

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Determine password strength
  const getPasswordStrength = (password) => {
    if (password.length < 6) return "Weak";
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && password.length >= 8)
      return "Strong";
    return "Medium";
  };

  const handlePasswordChange = (value) => {
    const cleanValue = DOMPurify.sanitize(value);
    setNewPassword(cleanValue);
    setPasswordStrength(getPasswordStrength(cleanValue));
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(DOMPurify.sanitize(value));
  };

  // Extract readable error message from backend
  const extractErrorMessage = (err) => {
    const data = err?.response?.data;
    if (!data) return "Unexpected error. Please try again.";

    if (data.errors && typeof data.errors === "object") {
      return Object.entries(data.errors)
        .map(([field, messages]) => `${field}: ${messages.join(" ")}`)
        .join("\n");
    }

    if (typeof data === "object") {
      return Object.entries(data)
        .map(([field, messages]) =>
          `${field}: ${Array.isArray(messages) ? messages.join(" ") : messages}`
        )
        .join("\n");
    }

    if (typeof data === "string") return data;

    return "An error occurred. Please try again.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // ✅ Send both password and confirm_password
      await authService.resetPasswordConfirm(uid, token, {
        password: newPassword,
        confirm_password: confirmPassword,
      });

      setMessage(
        "✅ Password has been reset successfully. Redirecting to login..."
      );
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Redirect if uid or token missing
  useEffect(() => {
    if (!uid || !token) {
      navigate("/forgot-password");
    }
  }, [uid, token, navigate]);

  return (
    <div className="forgot-password-page">
      <form className="forgot-password-form" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>

        {message && <p className="form-message success">{message}</p>}
        {error && <p className="form-message error">{error}</p>}

        <div className="form-group password-field">
          <input
            type={passwordVisible ? "text" : "password"}
            placeholder="New password"
            value={newPassword}
            onChange={(e) => handlePasswordChange(e.target.value)}
            required
            autoComplete="new-password"
          />
          <span onClick={() => setPasswordVisible((v) => !v)}>
            {passwordVisible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </span>
        </div>

        {newPassword && (
          <div className={`password-strength ${passwordStrength.toLowerCase()}`}>
            Password Strength: {passwordStrength}
          </div>
        )}

        <div className="form-group password-field">
          <input
            type={passwordVisible ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            required
            autoComplete="new-password"
          />
          <span onClick={() => setPasswordVisible((v) => !v)}>
            {passwordVisible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </span>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
