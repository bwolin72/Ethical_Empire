// src/components/Auth/Register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import authService from "../../api/services/authService"; // ✅ switched to new service
import PasswordInput from "../../components/common/PasswordInput";
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
    access_code: "",
    worker_category_id: "",
    company_name: "",
    agency_name: "",
    role: "user",
    acceptTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  /* ---------------- Dark mode ---------------- */
  useEffect(() => {
    const saved = localStorage.getItem("darkMode") === "true";
    setDarkMode(saved);
    document.body.classList.toggle("dark", saved);
  }, []);

  /* ---------------- Prefill worker code from URL ---------------- */
  useEffect(() => {
    const urlCode = searchParams.get("code");
    if (urlCode) {
      setForm((prev) => ({ ...prev, access_code: urlCode, role: "worker" }));
    }
  }, [searchParams]);

  const toggleDarkMode = () => {
    const updated = !darkMode;
    setDarkMode(updated);
    document.body.classList.toggle("dark", updated);
    localStorage.setItem("darkMode", updated);
    toast(updated ? "🌙 Dark mode enabled" : "☀️ Light mode enabled");
  };

  /* ---------------- Helpers ---------------- */
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const extractErrorMessage = (err) => {
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

  /* ---------------- Handlers ---------------- */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const cleanValue = DOMPurify.sanitize(value);
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : cleanValue,
    }));
  };

  const handlePhoneChange = (value) =>
    setForm((prev) => ({ ...prev, phone: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.acceptTerms) {
      toast.error("❌ You must accept Terms & Privacy Policy.");
      return;
    }

    const {
      full_name,
      email,
      phone,
      dob,
      gender,
      password,
      password2,
      role,
      access_code,
      worker_category_id,
      company_name,
      agency_name,
    } = form;

    if (!full_name.trim()) return toast.error("Full name is required.");
    if (!validateEmail(email)) return toast.error("Invalid email format.");
    if (!phone || phone.length < 10) return toast.error("Enter a valid phone number.");
    if (!dob) return toast.error("Date of birth is required.");
    if (!gender) return toast.error("Gender is required.");
    if (!password) return toast.error("Password is required.");
    if (password !== password2) return toast.error("Passwords do not match.");

    // Backend expects "name" not "full_name"
    const payload = { name: full_name, email, phone, dob, gender, password, password2 };
    let requestFn = authService.register; // ✅ switched

    if (role === "worker") {
      if (!access_code.trim()) return toast.error("Access code is required.");
      if (!worker_category_id) return toast.error("Worker category is required.");
      payload.access_code = access_code;
      payload.worker_category_id = worker_category_id;
      requestFn = authService.internalRegister; // ✅ switched
    } else if (role === "vendor") {
      if (!company_name.trim()) return toast.error("Company name is required.");
      payload.company_name = company_name;
    } else if (role === "partner") {
      if (!agency_name.trim()) return toast.error("Agency name is required.");
      payload.agency_name = agency_name;
    }

    setLoading(true);
    try {
      const res = await requestFn(payload);
      const { email: returnedEmail, phone: returnedPhone } = res.data;
      toast.success("✅ Verification code sent. Check email and SMS.");
      navigate(
        `/verify-otp?email=${encodeURIComponent(returnedEmail)}&phone=${encodeURIComponent(
          returnedPhone
        )}`
      );
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async ({ credential }) => {
    if (!credential) return toast.error("Google login failed.");
    setLoading(true);
    try {
      await authService.googleRegister({ credential }); // ✅ switched
      toast.success("Google registration successful! Redirecting...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className={`auth-wrapper ${darkMode ? "dark" : ""}`}>
        {/* Left Branding Panel */}
        <div className="auth-brand-panel">
          <img src={logo} alt="Logo" className="auth-logo" />
          <h2>Eethmgh Multimedia</h2>
          <p>Empowering creatives, vendors & partners with technology.</p>
          <button className="toggle-theme-btn" onClick={toggleDarkMode}>
            {darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </div>

        {/* Right Form Panel */}
        <div className="auth-form-panel">
          <h2 className="form-title">Create an Account</h2>
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Account Type */}
            <div className="input-group">
              <label>Account Type</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="user">Regular User</option>
                <option value="worker">Worker</option>
                <option value="vendor">Vendor</option>
                <option value="partner">Partner</option>
              </select>
            </div>

            {/* Conditional Fields */}
            {form.role === "worker" && (
              <>
                <div className="input-group">
                  <label>Access Code</label>
                  <input name="access_code" value={form.access_code} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Worker Category ID</label>
                  <input
                    name="worker_category_id"
                    type="number"
                    value={form.worker_category_id}
                    onChange={handleChange}
                  />
                </div>
              </>
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

            {/* Common Fields */}
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

            {/* Passwords */}
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
              <PasswordInput
                name="password2"
                value={form.password2}
                onChange={handleChange}
              />
            </div>

            {/* Terms */}
            <label className="terms-checkbox">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={form.acceptTerms}
                onChange={handleChange}
              />
              I accept <Link to="/terms">Terms & Conditions</Link> and{" "}
              <Link to="/privacy">Privacy Policy</Link>
            </label>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          {/* Google SignUp */}
          <div className="social-login">
            <p>Or register with Google:</p>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google sign-up failed.")}
              useOneTap
            />
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
