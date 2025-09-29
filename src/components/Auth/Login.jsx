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
    access_code: "",
    role: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const navigate = useNavigate();
  const { login, auth, ready } = useAuth();
  const user = auth?.user;

  /** Redirect user to the correct dashboard by role */
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

  /** Redirect if already logged in */
  useEffect(() => {
    if (ready && user?.role) {
      toast.success(`Welcome back, ${user.name || "User"}! 🎉`);
      redirectByRole(user.role);
    }
  }, [ready, user, redirectByRole]);

  /** Form input change */
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
    if (!form.role.trim()) errors.role = "Please select your role.";
    if (
      ["worker", "admin"].includes(form.role.toLowerCase()) &&
      !form.access_code.trim()
    ) {
      errors.access_code = "Access code is required for Admin/Worker.";
    }
    if (!acceptedTerms)
      errors.terms = "You must accept Terms & Privacy.";

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
      if (data.error && data.error.includes("access code"))
        return "Invalid access code.";
    }
    return "Login failed.";
  };

  /** Successful login handler */
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

  /** Submit login */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await authService.login(form);
      await handleLoginSuccess(res.data);
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
      const res = await authService.googleLogin({
        credential,
        remember: rememberMe,
      });
      await handleLoginSuccess(res.data);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const updated = !darkMode;
    setDarkMode(updated);
    document.body.classList.toggle("dark", updated);
    localStorage.setItem("darkMode", updated);
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className={`auth-wrapper ${darkMode ? "dark" : ""}`}>
        {/* Left Brand Panel */}
        <div className="auth-brand-panel artistic-bg">
          <img src={logo} alt="Logo" className="auth-logo" />
          <h2 className="brand-title">EETHM_GH</h2>
          <p className="brand-subtitle">Your Trusted Digital Hub in Ghana</p>
          <button className="toggle-theme-btn" onClick={toggleDarkMode}>
            {darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </div>

        {/* Right Form Panel */}
        <div className="auth-form-panel elegant-form">
          <h2 className="form-title">Welcome Back 👋</h2>
          <p className="form-subtitle">Login to continue your experience</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                className={formErrors.email ? "input-error" : ""}
                required
              />
              {formErrors.email && (
                <small className="error-text">{formErrors.email}</small>
              )}
            </div>

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

            {/* 🧩 Role Selection */}
            <div className="input-group">
              <label>Select Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                disabled={loading}
                className={formErrors.role ? "input-error" : ""}
              >
                <option value="">-- Choose your role --</option>
                <option value="vendor">Vendor</option>
                <option value="worker">Worker</option>
                <option value="admin">Admin</option>
                <option value="client">Client</option>
                <option value="user">Normal User</option>
              </select>
              {formErrors.role && (
                <small className="error-text">{formErrors.role}</small>
              )}
            </div>

            {/* 🔐 Dynamic Access Code */}
            {["worker", "admin"].includes(form.role.toLowerCase()) && (
              <div className="input-group fade-in">
                <label>Access Code</label>
                <input
                  type="text"
                  name="access_code"
                  placeholder="Enter your access code"
                  value={form.access_code}
                  onChange={handleChange}
                  disabled={loading}
                  className={formErrors.access_code ? "input-error" : ""}
                />
                {formErrors.access_code && (
                  <small className="error-text">{formErrors.access_code}</small>
                )}
              </div>
            )}

            <label className="terms-checkbox">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={() => setAcceptedTerms((prev) => !prev)}
              />
              I accept <Link to="/terms">Terms</Link> &{" "}
              <Link to="/privacy">Privacy</Link>
            </label>
            {formErrors.terms && (
              <small className="error-text">{formErrors.terms}</small>
            )}

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
              className="auth-submit-btn gradient-btn"
              disabled={loading || !acceptedTerms}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="social-login">
            <p>Or sign in with Google:</p>
            <GoogleLogin
              onSuccess={(res) => handleGoogleCredential(res?.credential)}
              onError={() => toast.error("Google login failed")}
              useOneTap
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
