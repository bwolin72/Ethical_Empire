// src/pages/auth/ForgotPassword.jsx
import React, { useState } from "react";
import "./ForgotResetPassword.css";
import authService from "../../api/services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      // ✅ Call authService instead of authAPI
      const response = await authService.resetPassword({ email });

      setMessage(
        response?.data?.detail ||
          "Password reset email sent. Please check your inbox."
      );
      setEmail("");
    } catch (err) {
      console.error("Password reset error:", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <form className="forgot-password-form" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>

        {message && (
          <p className="form-message success" role="alert" aria-live="polite">
            {message}
          </p>
        )}
        {error && (
          <p className="form-message error" role="alert" aria-live="assertive">
            {error}
          </p>
        )}

        <label htmlFor="email" className="sr-only">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Email"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
