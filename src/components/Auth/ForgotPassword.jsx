// src/pages/auth/ForgotPassword.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import authService from "../../api/services/authService";
import "./Auth.css";

/**
 * Handles password reset requests safely with reCAPTCHA protection.
 * Prevents reCAPTCHA timeouts, ad-blocker issues, and double submissions.
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  const siteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY; // from .env

  /**
   * Dynamically load Google reCAPTCHA script if not already loaded.
   * This prevents timeout errors on slow networks or blocked scripts.
   */
  useEffect(() => {
    const existing = document.querySelector("script[src*='recaptcha/api.js']");
    if (existing) {
      setRecaptchaReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => setRecaptchaReady(true);
    script.onerror = () => {
      console.warn("⚠️ reCAPTCHA script failed to load — possibly blocked.");
      setRecaptchaReady(false);
    };

    document.body.appendChild(script);
  }, [siteKey]);

  /**
   * Execute invisible reCAPTCHA (v3) to get a token before sending the reset request.
   */
  const executeRecaptcha = async () => {
    if (!window.grecaptcha || !recaptchaReady) {
      console.warn("⚠️ reCAPTCHA not ready — skipping verification.");
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(siteKey, { action: "forgot_password" });
      return token;
    } catch (err) {
      console.error("reCAPTCHA error:", err);
      return null;
    }
  };

  /**
   * Submit handler — validates, fetches reCAPTCHA token, sends reset request.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const recaptchaToken = await executeRecaptcha();

      const response = await authService.requestPasswordReset({
        email: email.trim(),
        recaptcha_token: recaptchaToken,
      });

      setMessage(
        response?.data?.message ||
          "✅ Password reset email sent. Please check your inbox."
      );
      setEmail("");
      toast.success("Password reset link sent!");
    } catch (err) {
      console.error("Password reset error:", err);

      const data = err?.response?.data;
      let errMsg = "An error occurred. Please try again.";

      if (data) {
        if (data.message) errMsg = data.message;
        else if (data.error) errMsg = data.error;
        else if (typeof data === "string") errMsg = data;
      }

      // Handle reCAPTCHA timeout or block cases gracefully
      if (err?.message?.includes("Timeout") || /recaptcha/i.test(errMsg)) {
        errMsg =
          "Google reCAPTCHA took too long to respond. Please reload or disable ad-blockers.";
      }

      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <form className="forgot-password-form" onSubmit={handleSubmit} noValidate>
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
          autoComplete="email"
          disabled={loading}
        />

        <button type="submit" disabled={loading || !recaptchaReady}>
          {loading ? "Sending..." : "Send Reset Email"}
        </button>

        {!recaptchaReady && (
          <small className="recaptcha-warning">
            ⚠️ reCAPTCHA not loaded — check your network or disable ad-blockers.
          </small>
        )}
      </form>
    </div>
  );
};

export default ForgotPassword;
