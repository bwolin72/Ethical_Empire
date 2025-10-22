import React, { useState, useEffect, useCallback } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import authService from "../../api/services/authService";
import { useAuth } from "../../components/context/AuthContext";
import { roleRoutes } from "../../routes/roleRoutes";

import logo from "../../assets/logo.png";
import PasswordInput from "../../components/common/PasswordInput";
import "./Auth.css";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "", role: "", accessCode: "" });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, auth, ready } = useAuth();
  const user = auth?.user;

  // Redirect user safely
  const redirectByRole = useCallback(
    (role) => {
      const path = roleRoutes[role?.toLowerCase()] || roleRoutes.user;
      let nextPath = new URLSearchParams(location.search).get("next") || "";
      if (PUBLIC_ROUTES.includes(nextPath)) nextPath = "";
      console.log("[REDIRECT] Redirecting user role:", role, "to path:", nextPath || path);
      navigate(nextPath || path, { replace: true });
    },
    [navigate, location.search]
  );

  // Load dark mode
  useEffect(() => {
    const saved = localStorage.getItem("darkMode") === "true";
    setDarkMode(saved);
    document.body.classList.toggle("dark", saved);
    console.log("[THEME] Dark mode loaded:", saved);
  }, []);

  // Auto redirect if already logged in
  useEffect(() => {
    if (ready && user?.role) {
      console.log("[AUTO-LOGIN] User already logged in:", user);
      toast.success(`Welcome back, ${user.name || "User"}! 🎉`);
      redirectByRole(user.role);
    }
  }, [ready, user, redirectByRole]);

  const toggleDarkMode = () => {
    const updated = !darkMode;
    setDarkMode(updated);
    document.body.classList.toggle("dark", updated);
    localStorage.setItem("darkMode", updated);
    console.log("[THEME] Dark mode toggled:", updated);
    toast(updated ? "🌙 Dark mode enabled" : "☀️ Light mode enabled");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    console.log(`[FORM] Field changed: ${name} = ${value}`);
  };

  const validateForm = () => {
    const errors = {};
    if (!form.email.trim()) errors.email = "Please enter your email.";
    if (!form.password.trim()) errors.password = "Please enter your password.";
    if (!form.role) errors.role = "Please select your role.";
    if (form.role === "worker" && !form.accessCode.trim()) errors.accessCode = "Please enter your access code.";
    if (!acceptedTerms) errors.terms = "You must accept Terms & Privacy.";

    setFormErrors(errors);
    if (Object.keys(errors).length) {
      toast.error("Please fix the highlighted errors.");
      console.warn("[FORM VALIDATION] Errors:", errors);
    } else {
      console.log("[FORM VALIDATION] Passed");
    }
    return Object.keys(errors).length === 0;
  };

  const extractErrorMessage = (err) => {
    console.error("[LOGIN ERROR] Full error object:", err);
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

  const handleLoginSuccess = async (data) => {
    console.log("[LOGIN SUCCESS] Backend response:", data);
    const { tokens, user: apiUser } = data;
    const { access, refresh } = tokens || {};
    if (!access || !refresh || !apiUser) {
      console.error("[LOGIN SUCCESS] Invalid token or user in response");
      return toast.error("Invalid login response.");
    }

    console.log("[LOGIN SUCCESS] Logging in user:", apiUser);
    login({ access, refresh, user: apiUser, remember: rememberMe });
    redirectByRole(apiUser.role);
    toast.success(`Welcome, ${apiUser.name || "User"} 🎉`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[SUBMIT] Login form submitted:", form);
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await authService.login(form, rememberMe);
      console.log("[SUBMIT] Backend login response:", res);
      await handleLoginSuccess(res);
    } catch (err) {
      const msg = extractErrorMessage(err);
      console.error("[SUBMIT] Login failed:", msg);
      toast.error(msg);
      setForm((prev) => ({ ...prev, password: "" }));
    } finally {
      setLoading(false);
      console.log("[SUBMIT] Loading state reset to false");
    }
  };

  const handleGoogleCredential = async (credential) => {
    console.log("[GOOGLE LOGIN] Credential received:", credential);
    if (!credential) return toast.error("Google login failed.");
    setLoading(true);
    try {
      const res = await authService.googleLogin({ credential, remember: rememberMe });
      console.log("[GOOGLE LOGIN] Backend response:", res);
      await handleLoginSuccess(res);
    } catch (err) {
      const msg = extractErrorMessage(err);
      console.error("[GOOGLE LOGIN] Failed:", msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      console.log("[GOOGLE LOGIN] Loading state reset to false");
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className={`auth-wrapper ${darkMode ? "dark" : ""}`}>
        <div className="auth-brand-panel">
          <img src={logo} alt="Logo" className="auth-logo" />
          <h1>EETHM_GH</h1>
          <p>Your Trusted Digital Hub in Ghana</p>
          <button className="toggle-theme-btn" onClick={toggleDarkMode}>
            {darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </div>

        <div className="auth-form-panel">
          <h2 className="form-title">Welcome Back 👋</h2>
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
                {formErrors.accessCode && <small className="error-text">{formErrors.accessCode}</small>}
              </div>
            )}

            <label className="terms-checkbox">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={() => setAcceptedTerms((prev) => !prev)}
              />
              I accept <Link to="/terms">Terms</Link> & <Link to="/privacy">Privacy</Link>
            </label>
            {formErrors.terms && <small className="error-text">{formErrors.terms}</small>}

            <div className="auth-options">
              <label className="remember-me">
                <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                Keep me signed in
              </label>
              <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading || !acceptedTerms}>
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

          <p className="register-prompt">Don’t have an account? <Link to="/register">Register</Link></p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
