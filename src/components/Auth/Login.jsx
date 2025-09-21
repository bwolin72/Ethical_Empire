import React, { useState, useEffect, useCallback } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import authService from "../../api/authService";       // ✅ fixed import
import { useAuth } from "../context/AuthContext";
import logo from "../../assets/logo.png";
import PasswordInput from "../common/PasswordInput";   // ✅ shared password field
import "./Auth.css";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const navigate = useNavigate();
  const { login, auth, ready } = useAuth();
  const user = auth?.user;

  /* ---------- Role-based redirect ---------- */
  const redirectByRole = useCallback(
    (role) => {
      const routes = {
        admin: "/admin",
        worker: "/worker",
        user: "/user",
        vendor: "/vendor-profile",
        partner: "/partner-profile",
      };
      navigate(routes[role] || "/user", { replace: true });
    },
    [navigate]
  );

  /* ---------- Dark mode toggle ---------- */
  useEffect(() => {
    const saved = localStorage.getItem("darkMode") === "true";
    setDarkMode(saved);
    document.body.classList.toggle("dark", saved);
  }, []);

  /* ---------- Auto redirect if already logged in ---------- */
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

  const validateForm = () => {
    const errors = {};
    if (!form.email.trim()) errors.email = "Please enter your email.";
    if (!form.password.trim()) errors.password = "Please enter your password.";
    if (!acceptedTerms) errors.terms = "You must accept Terms & Privacy.";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) toast.error("Please fix the highlighted errors.");
    return Object.keys(errors).length === 0;
  };

  const extractErrorMessage = (err) => {
    const data = err?.response?.data;
    if (typeof data === "string") return data;
    if (Array.isArray(data)) return data[0];
    if (typeof data === "object") return data.message || data.detail || "Login failed.";
    return "Something went wrong.";
  };

  const handleLoginSuccess = (data) => {
    const { access, refresh, user } = data;
    if (!access || !refresh || !user) {
      toast.error("Invalid login response.");
      return;
    }

    login({
      access,
      refresh,
      user: { name: user.name, email: user.email, role: user.role },
      remember: rememberMe,
    });

    toast.success(`Welcome, ${user.name || "User"} 🎉`);
    redirectByRole(user.role);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await authService.login(form);          // ✅ use authService
      handleLoginSuccess(res.data);
    } catch (err) {
      const msg = extractErrorMessage(err);
      toast.error(msg);
      setForm((prev) => ({ ...prev, password: "" }));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async ({ credential }) => {
    if (!credential) {
      toast.error("Google login failed.");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.googleLogin({ credential }); // ✅ use authService
      handleLoginSuccess(res.data);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className={`auth-wrapper ${darkMode ? "dark" : ""}`}>
        {/* Left Branding Panel */}
        <div className="auth-brand-panel">
          <img src={logo} alt="Logo" className="auth-logo" />
          <h2>EETHM_GH</h2>
          <p>Your Trusted Digital Hub in Ghana</p>
          <button className="toggle-theme-btn" onClick={toggleDarkMode}>
            {darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </div>

        {/* Right Form Panel */}
        <div className="auth-form-panel">
          <h2 className="form-title">Welcome Back 👋</h2>
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
                required
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
              />
              {formErrors.password && <small className="error-text">{formErrors.password}</small>}
            </div>

            <label className="terms-checkbox">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={() => setAcceptedTerms((prev) => !prev)}
              />
              I accept <Link to="/terms">Terms</Link> &{" "}
              <Link to="/privacy">Privacy</Link>
            </label>
            {formErrors.terms && <small className="error-text">{formErrors.terms}</small>}

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

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="social-login">
            <p>Or sign in with Google:</p>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google login failed")}
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
