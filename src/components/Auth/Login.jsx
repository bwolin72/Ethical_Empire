// src/components/Auth/Login.jsx
import React, { useState, useEffect, useCallback } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import authService from "../../api/services/authService";
import { useAuth } from "../context/AuthContext";
import { roleRoutes } from "../../routes/roleRoutes";

import logo from "../../assets/logo.png";
import PasswordInput from "../common/PasswordInput";
import "./Auth.css";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "",
    accessCode: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, auth, ready } = useAuth();
  const user = auth?.user;

  // -----------------------------
  // Role-based redirect logic
  // -----------------------------
  const redirectByRole = useCallback(
    (role) => {
      const defaultPath = roleRoutes[role?.toLowerCase()] || "/user";
      const searchParams = new URLSearchParams(location.search);
      let nextPath = searchParams.get("next");

      if (!nextPath || PUBLIC_ROUTES.some((r) => nextPath.startsWith(r))) {
        nextPath = defaultPath;
      }

      window.history.replaceState({}, document.title, location.pathname);
      console.log("[REDIRECT] Navigating to:", nextPath);
      navigate(nextPath, { replace: true });
    },
    [navigate, location]
  );

  // -----------------------------
  // Auto redirect if already logged in
  // -----------------------------
  useEffect(() => {
    if (ready && user?.role) {
      toast.success(`Welcome back, ${user.name || "User"}! 🎉`);
      redirectByRole(user.role);
    }
  }, [ready, user, redirectByRole]);

  // -----------------------------
  // Theme toggle
  // -----------------------------
  useEffect(() => {
    const saved = localStorage.getItem("darkMode") === "true";
    setDarkMode(saved);
    document.body.classList.toggle("dark", saved);
  }, []);

  const toggleDarkMode = () => {
    const updated = !darkMode;
    setDarkMode(updated);
    document.body.classList.toggle("dark", updated);
    localStorage.setItem("darkMode", updated);
    toast(updated ? "🌙 Dark mode enabled" : "☀️ Light mode enabled");
  };

  // -----------------------------
  // Form handling
  // -----------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!form.role) errors.role = "Please select your role.";
    if (!form.email.trim()) errors.email = "Please enter your email.";
    if (!form.password.trim()) errors.password = "Please enter your password.";
    if (form.role === "worker" && !form.accessCode.trim())
      errors.accessCode = "Please enter your access code.";
    if (!acceptedTerms) errors.terms = "You must accept Terms & Privacy.";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the highlighted errors.");
      return false;
    }
    return true;
  };

  const extractErrorMessage = (err) => {
    const data = err?.response?.data;
    if (!data) return "Something went wrong.";
    if (typeof data === "string") return data;
    if (Array.isArray(data)) return data[0];
    if (typeof data === "object") {
      return data.detail || data.message || Object.values(data.errors || {}).flat().join(" ");
    }
    return "Login failed.";
  };

  // -----------------------------
  // Corrected: Handle Login Success (match backend)
  // -----------------------------
  const handleLoginSuccess = (data) => {
    // Backend returns: { user: { tokens: { access, refresh }, ... } }
    const apiUser = data?.user;
    const access = apiUser?.tokens?.access;
    const refresh = apiUser?.tokens?.refresh;

    if (!access || !refresh || !apiUser) {
      toast.error("Invalid login response from server.");
      console.warn("[LOGIN] Unexpected response:", data);
      return;
    }

    login({ access, refresh, user: apiUser, remember: rememberMe });
    toast.success(`Welcome, ${apiUser.name || "User"} 🎉`);
    redirectByRole(apiUser.role?.toLowerCase() || "user");
  };

  // -----------------------------
  // Corrected: Form submit
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await authService.login(form, rememberMe);
      handleLoginSuccess(res);
    } catch (err) {
      toast.error(extractErrorMessage(err));
      setForm((prev) => ({ ...prev, password: "" }));
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Corrected: Google OAuth login
  // -----------------------------
  const handleGoogleCredential = async (credential) => {
    if (!credential) return toast.error("Google login failed.");
    setLoading(true);
    try {
      const res = await authService.googleLogin({ credential, remember: rememberMe });
      handleLoginSuccess(res);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (err) => {
    if (err?.type === "popup_closed_by_user") return;
    console.warn("[Google Sign-In Error]", err);
  };

  // -----------------------------
  // Prevent rendering until AuthContext ready
  // -----------------------------
  if (!ready) return null;

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className={`auth-wrapper ${darkMode ? "dark" : ""}`}>
        {/* Brand */}
        <div className="auth-brand-panel">
          <img src={logo} alt="Logo" className="auth-logo" />
          <h1>EETHM_GH</h1>
          <p>Your Trusted Digital Hub in Ghana</p>
          <button className="toggle-theme-btn" onClick={toggleDarkMode}>
            {darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </div>

        {/* Login Form */}
        <div className="auth-form-panel">
          <h2 className="form-title">Welcome Back 👋</h2>
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Role */}
            <div className="input-group">
              <label>Login As</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                disabled={loading}
                className={formErrors.role ? "input-error" : ""}
              >
                <option value="">Select role</option>
                <option value="user">User</option>
                <option value="worker">Worker</option>
                <option value="admin">Admin</option>
                <option value="vendor">Vendor</option>
                <option value="partner">Partner</option>
              </select>
              {formErrors.role && <small className="error-text">{formErrors.role}</small>}
            </div>

            {/* Email */}
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className={formErrors.email ? "input-error" : ""}
                disabled={loading}
                autoComplete="email"
                required
                aria-label="Email"
              />
              {formErrors.email && <small className="error-text">{formErrors.email}</small>}
            </div>

            {/* Password */}
            <div className="input-group">
              <label>Password</label>
              <PasswordInput
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
              />
              {formErrors.password && (
                <small className="error-text">{formErrors.password}</small>
              )}
            </div>

            {/* Worker Access Code */}
            {form.role === "worker" && (
              <div className="input-group">
                <label>Access Code</label>
                <input
                  type="text"
                  name="accessCode"
                  placeholder="Enter your access code"
                  value={form.accessCode}
                  onChange={handleChange}
                  className={formErrors.accessCode ? "input-error" : ""}
                  disabled={loading}
                />
                {formErrors.accessCode && (
                  <small className="error-text">{formErrors.accessCode}</small>
                )}
              </div>
            )}

            {/* Terms */}
            <label className="terms-checkbox">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={() => setAcceptedTerms((prev) => !prev)}
              />
              I accept <Link to="/terms">Terms</Link> & <Link to="/privacy">Privacy</Link>
            </label>
            {formErrors.terms && <small className="error-text">{formErrors.terms}</small>}

            {/* Options */}
            <div className="auth-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Keep me signed in
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading || !acceptedTerms}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Google Login */}
          <div className="social-login">
            <p>Or sign in with Google:</p>
            <GoogleLogin
              onSuccess={(res) => handleGoogleCredential(res?.credential)}
              onError={handleGoogleError}
              disabled={loading}
            />
          </div>

          <p className="register-prompt">
            Don’t have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
