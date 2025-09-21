// src/components/Auth/Register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import authService from "../../api/services/authService";
import PasswordInput from "../common/PasswordInput";
import logo from "../../assets/logo.png";
import "./Auth.css";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    password: "",
    password2: "",
    worker_category: "",
    company_name: "",
    agency_name: "",
    role: "user",
    acceptTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  // ---------------- Dark mode ----------------
  useEffect(() => {
    const saved = localStorage.getItem("darkMode") === "true";
    setDarkMode(saved);
    document.body.classList.toggle("dark", saved);
  }, []);

  // ---------------- Prefill worker code from URL ----------------
  useEffect(() => {
    const urlCode = searchParams.get("code");
    if (urlCode) {
      setForm(prev => ({ ...prev, role: "worker", worker_category: urlCode }));
    }
  }, [searchParams]);

  const toggleDarkMode = () => {
    const updated = !darkMode;
    setDarkMode(updated);
    document.body.classList.toggle("dark", updated);
    localStorage.setItem("darkMode", updated);
    toast(updated ? "🌙 Dark mode enabled" : "☀️ Light mode enabled");
  };

  // ---------------- Helpers ----------------
  const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

  const extractErrorMessage = err => {
    const data = err?.response?.data;
    if (!data) return "Unexpected error. Please try again.";
    if (data.errors && typeof data.errors === "object") {
      return Object.entries(data.errors)
        .map(([field, msgs]) => `${capitalize(field)}: ${msgs.join(" ")}`)
        .join("\n");
    }
    if (typeof data === "object") {
      return Object.entries(data)
        .map(([field, msgs]) =>
          `${capitalize(field)}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`
        )
        .join("\n");
    }
    if (typeof data === "string") return data;
    return "An error occurred. Please check your input.";
  };

  // ---------------- Handlers ----------------
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    const cleanValue = DOMPurify.sanitize(value);
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : cleanValue,
    }));
  };

  const handlePhoneChange = value => setForm(prev => ({ ...prev, phone: value }));

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.acceptTerms) {
      toast.error("❌ You must accept Terms & Privacy Policy.");
      return;
    }

    const { full_name, email, phone, dob, gender, password, password2, role, worker_category, company_name, agency_name } = form;

    if (!full_name.trim()) return toast.error("Full name is required.");
    if (!validateEmail(email)) return toast.error("Invalid email format.");
    if (!phone || phone.length < 10) return toast.error("Enter a valid phone number.");
    if (!dob) return toast.error("Date of birth is required.");
    if (!gender) return toast.error("Gender is required.");
    if (!password) return toast.error("Password is required.");
    if (password !== password2) return toast.error("Passwords do not match.");

    const payload = {
      name: full_name,
      email,
      phone,
      dob,
      gender,
      password,
      password2,
      role,
      worker_category: role === "worker" ? worker_category : undefined,
      company_name: role === "vendor" ? company_name : undefined,
      agency_name: role === "partner" ? agency_name : undefined,
    };

    setLoading(true);
    try {
      const res = await authService.register(payload);
      const { email: returnedEmail, phone: returnedPhone } = res.data;
      toast.success("✅ Verification code sent. Check email and SMS.");
      navigate(
        `/verify-otp?email=${encodeURIComponent(returnedEmail)}&phone=${encodeURIComponent(returnedPhone)}`
      );
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async ({ credential }) => {
    if (!credential) return toast.error("Google registration failed.");
    setLoading(true);
    try {
      await authService.googleRegister({ credential });
      toast.success("Google registration successful! Redirecting...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className={`auth-wrapper ${darkMode ? "dark" : ""}`}>
        <div className="auth-brand-panel">
          <img src={logo} alt="Logo" className="auth-logo" />
          <h2>Eethmgh Multimedia</h2>
          <p>Empowering creatives, vendors & partners with technology.</p>
          <button className="toggle-theme-btn" onClick={toggleDarkMode}>
            {darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </div>

        <div className="auth-form-panel">
          <h2 className="form-title">Create an Account</h2>
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="input-group">
              <label>Account Type</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="user">Regular User</option>
                <option value="worker">Worker</option>
                <option value="vendor">Vendor</option>
                <option value="partner">Partner</option>
              </select>
            </div>

            {form.role === "worker" && (
              <div className="input-group">
                <label>Worker Category</label>
                <input name="worker_category" value={form.worker_category} onChange={handleChange} />
              </div>
            )}
            {form.role === "vendor" && (
              <div className="input-group">
                <label>Company Name</label>
                <input name="company_name" value={form.company_name} onChange={handleChange} />
              </div>
            )}
            {form.role === "partner" && (
              <div className="input-group">
                <label>Agency Name</label>
                <input name="agency_name" value={form.agency_name} onChange={handleChange} />
              </div>
            )}

            <div className="input-group">
              <label>Full Name</label>
              <input name="full_name" value={form.full_name} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Phone</label>
              <PhoneInput defaultCountry="GH" value={form.phone} onChange={handlePhoneChange} />
            </div>
            <div className="input-group">
              <label>Date of Birth</label>
              <input type="date" name="dob" value={form.dob} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="input-group">
              <label>Password</label>
              <PasswordInput
                name="password"
                value={form.password}
                onChange={handleChange}
                showStrength
                onStrengthChange={setPasswordStrength}
              />
            </div>
            <div className="input-group">
              <label>Confirm Password</label>
              <PasswordInput name="password2" value={form.password2} onChange={handleChange} />
            </div>

            <label className="terms-checkbox">
              <input type="checkbox" name="acceptTerms" checked={form.acceptTerms} onChange={handleChange} />
              I accept <Link to="/terms">Terms & Conditions</Link> and <Link to="/privacy">Privacy Policy</Link>
            </label>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <div className="social-login">
            <p>Or register with Google:</p>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google sign-up failed.")} useOneTap />
          </div>

          <p className="register-prompt">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Register;
