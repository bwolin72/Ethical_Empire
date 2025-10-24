import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DOMPurify from "dompurify";
import authService from "../../api/services/authService";
import PasswordInput from "./PasswordInput";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/PasswordForm.css";

/**
 * Props:
 * - mode: "forgot" | "reset" | "update"
 * - showCurrent?: boolean (for update mode)
 */
const PasswordForm = ({ mode = "forgot", showCurrent = false }) => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const uid = params.get("uid");
  const token = params.get("token");

  useEffect(() => {
    if (mode === "reset" && (!uid || !token)) {
      toast.error("❌ Missing reset credentials.");
      navigate("/reset-password");
    }
  }, [mode, uid, token, navigate]);

  const getPasswordStrength = (password) => {
    if (password.length < 6) return "Weak";
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && password.length >= 8)
      return "Strong";
    return "Medium";
  };

  const handlePasswordChange = (setter) => (e) => {
    const cleanValue = DOMPurify.sanitize(e.target.value);
    setter(cleanValue);
    if (setter === setNewPassword) setPasswordStrength(getPasswordStrength(cleanValue));
  };

  const extractErrorMessage = (err) => {
    const data = err?.response?.data;
    if (!data) return "Unexpected error. Please try again.";
    if (data.detail) return data.detail;
    if (data.error) return data.error;
    if (typeof data === "string") return data;
    return JSON.stringify(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Validation
    if (mode === "forgot" && !email) return toast.warn("⚠️ Please enter your email.");
    if ((mode === "reset" || mode === "update") && !newPassword)
      return toast.warn("⚠️ Please enter a new password.");
    if ((mode === "reset" || mode === "update") && newPassword !== confirmPassword)
      return toast.error("❌ Passwords do not match.");
    if (mode === "update" && showCurrent && !currentPassword)
      return toast.warn("⚠️ Please enter your current password.");

    setLoading(true);

    try {
      if (mode === "forgot") {
        const response = await authService.resetPassword({ email });
        setMessage(response?.data?.detail || "✅ Password reset email sent.");
        setEmail("");
      } else if (mode === "reset") {
        await authService.resetPasswordConfirm(uid, token, { password: newPassword });
        toast.success("✅ Password has been reset. Redirecting...");
        setTimeout(() => navigate("/login"), 2500);
      } else if (mode === "update") {
        await authService.changePassword({
          current_password: currentPassword,
          new_password: newPassword,
        });
        toast.success("✅ Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-form-container">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar theme="colored" />
      <form className="password-form" onSubmit={handleSubmit}>
        <h2>
          {mode === "forgot" && "Forgot Password"}
          {mode === "reset" && "Reset Password"}
          {mode === "update" && "Change Password"}
        </h2>

        {message && <p className="form-message success">{message}</p>}
        {error && <p className="form-message error">{error}</p>}

        {mode === "forgot" && (
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(DOMPurify.sanitize(e.target.value))}
            placeholder="Enter your registered email"
            autoComplete="email"
            required
            aria-label="Email"
          />
        )}

        {mode === "update" && showCurrent && (
          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChange={handlePasswordChange(setCurrentPassword)}
            placeholder="Current Password"
            name="current-password"
          />
        )}

        {(mode === "reset" || mode === "update") && (
          <>
            <PasswordInput
              label="New Password"
              value={newPassword}
              onChange={handlePasswordChange(setNewPassword)}
              placeholder="New Password"
              name="new-password"
            />
            {newPassword && (
              <div className={`password-strength ${passwordStrength.toLowerCase()}`}>
                Password Strength: {passwordStrength}
              </div>
            )}
            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChange={handlePasswordChange(setConfirmPassword)}
              placeholder="Confirm New Password"
              name="confirm-password"
            />
          </>
        )}

        <button type="submit" className="btn" disabled={loading}>
          {loading
            ? "Submitting..."
            : mode === "forgot"
            ? "Send Reset Email"
            : mode === "reset"
            ? "Reset Password"
            : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default PasswordForm;
