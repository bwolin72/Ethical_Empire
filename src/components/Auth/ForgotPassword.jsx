// src/pages/auth/ForgotPassword.jsx
import React, { useState } from "react";
import "./Auth.css";
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

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    console.log("Submitting email:", email);

    try {
      // Send email to backend
      const response = await authService.resetPassword({ email });

      // Backend now returns { message: "Password reset email sent." }
      setMessage(
        response?.data?.message ||
          "Password reset email sent. Please check your inbox."
      );
      setEmail("");
    } catch (err) {
      console.error("Password reset error:", err);

      const data = err?.response?.data;
      let errMsg = "An error occurred. Please try again.";

      if (data) {
        // Match backend keys
        if (data.message) errMsg = data.message;
        else if (data.error) errMsg = data.error;
        else if (typeof data === "string") errMsg = data;
      }

      setError(errMsg);
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
          onChange={(e) => setEmail(e.target.value.trim())}
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
