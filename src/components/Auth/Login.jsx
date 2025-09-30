import React, { useState, useEffect, useCallback } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import authService from "../../api/services/authService";
import { useAuth } from "../../components/context/AuthContext";
import { roleRoutes } from "../../routes/roleRoutes";

import logo from "../../assets/logo.png";
import PasswordInput from "../../components/common/PasswordInput";
import "./Auth.css";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

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
  const { login, auth, ready } = useAuth();
  const user = auth?.user;

  /** Redirect user by role */
  const redirectByRole = useCallback(
    (role) => {
      const path = roleRoutes[role?.toLowerCase()] || roleRoutes.user;
      navigate(path, { replace: true });
    },
    [navigate]
  );

  /** Load dark mode preference */
  useEffect(() => {
    const saved = localStorage.getItem("darkMode") === "true";
    setDarkMode(saved);
    document.body.classList.toggle("dark", saved);
  }, []);

  /** Auto redirect if logged in */
  useEffect(() => {
    if (ready && user?.role) {
      toast.success(`Welcome back, ${user.name || "User"}! 🎉`);
      redirectByRole(user.role);
    }
  }, [ready, user, redirectByRole]);

  const toggleDarkMode = () => {
    const updated = !darkMode;
    setDarkMode(updated);
    document.body.classList.toggle("dark", updated);
    localStorage.setItem("darkMode", updated);
    toast(updated ? "🌙 Dark mode enabled" : "☀️ Light mode enabled");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /** Validate form */
  const validateForm = () => {
    const errors = {};
    if (!form.email.trim()) errors.email = "Please enter your email.";
    if (!form.password.trim()) errors.password = "Please enter your password.";
    if (!form.role) errors.role = "Please select your role.";
    if (form.role === "worker" && !form.accessCode.trim()) {
      errors.accessCode = "Please enter your access code.";
    }
    if (!acceptedTerms) errors.terms = "You must accept Terms & Privacy.";

    setFormErrors(errors);
    if (Object.keys(errors).length) toast.error("Please fix the highlighted errors.");
    return Object.keys(errors).length === 0;
  };

  const extractErrorMessage = (err) => {
    const data = err?.response?.data;
    if (!data) return "Something went wrong.";
    if (typeof data === "string") return data;
    if (Array.isArray(data)) return data[0];
    if (typeof data === "object") {
      if (data.detail) return data.detail;
      if (data.message) return data.message;
      if (data.errors) return Object.values(data.errors).flat().join(" ");
    }
    return "Login failed.";
  };

  /** Handle successful login */
  const handleLoginSuccess = async (data) => {
    const { tokens, user: apiUser } = data;
    const { access, refresh } = tokens || {};

    if (!access || !refresh || !apiUser) {
      toast.error("Invalid login response.");
      return;
    }

    login({ access, refresh, user: apiUser, remember: rememberMe });
    redirectByRole(apiUser.role);
    toast.success(`Welcome, ${apiUser.name || "User"} 🎉`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await authService.login(form, rememberMe);
      await handleLoginSuccess(res);
    } catch (err) {
      toast.error(extractErrorMessage(err));
      setForm((prev) => ({ ...prev, password: "" }));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    if (!credential) return toast.error("Google login failed.");
    setLoading(true);
    try {
      const res = await authService.googleLogin({ credential, remember: rememberMe });
      await handleLoginSuccess(res);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className={`auth-wrapper ${darkMode ? "dark" : ""}`}>
        {/* Left Panel */}
        <div className="auth-brand-panel">
          <img src={logo} alt="Logo" className="auth-logo" />
          <h1>EETHM_GH</h1>
          <p>Your Trusted Digital Hub in Ghana</p>
          <button className="toggle-theme-btn" onClick={toggleDarkMode}>
            {darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </div>

        {/* Form Panel */}
        <div className="auth-form-panel">
          <h2 className="form-title">Welcome Back 👋</h2>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Role Selector */}
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
              {formErrors.password && <small className="error-text">{formErrors.password}</small>}
            </div>

            {/* Access Code (only WORKER role) */}
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

            {/* Submit */}
            <button type="submit" className="auth-submit-btn" disabled={loading || !acceptedTerms}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Google Login */}
          <div className="social-login">
            <p>Or sign in with Google:</p>
            <GoogleLogin
              onSuccess={(res) => handleGoogleCredential(res?.credential)}
              onError={() => toast.error("Google login failed")}
              useOneTap
              disabled={loading}
            />
          </div>

          {/* Register Link */}
          <p className="register-prompt">
            Don’t have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
