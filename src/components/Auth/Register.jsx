import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import authAPI from "../../api/authAPI";
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
    role: "USER",
    acceptTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  useEffect(() => {
    const savedDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDark);
    document.body.classList.toggle("dark", savedDark);

    const urlCode = searchParams.get("code");
    if (urlCode) {
      setForm((prev) => ({ ...prev, access_code: urlCode, role: "WORKER" }));
    }
  }, [searchParams]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const getPasswordStrength = (password) => {
    if (password.length < 6) return "Weak";
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && password.length >= 8)
      return "Strong";
    return "Medium";
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const extractErrorMessage = (err) => {
    const data = err?.response?.data;
    if (!data) return "Unexpected error. Please try again.";
    if (data.errors && typeof data.errors === "object") {
      return Object.entries(data.errors)
        .map(([field, messages]) => `${capitalize(field)}: ${messages.join(" ")}`)
        .join("\n");
    }
    if (typeof data === "object") {
      return Object.entries(data)
        .map(([field, messages]) =>
          `${capitalize(field)}: ${
            Array.isArray(messages) ? messages.join(" ") : messages
          }`
        )
        .join("\n");
    }
    if (typeof data === "string") return data;
    return "An error occurred. Please check your input.";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const cleanValue = DOMPurify.sanitize(value);

    if (name === "password") setPasswordStrength(getPasswordStrength(cleanValue));

    if (type === "checkbox") setForm((prev) => ({ ...prev, [name]: checked }));
    else setForm((prev) => ({ ...prev, [name]: cleanValue }));
  };

  const handlePhoneChange = (value) => setForm((prev) => ({ ...prev, phone: value }));

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

    const payload = { name: full_name, email, phone, dob, gender, password, password2 };
    let requestFn = authAPI.register;

    if (role === "WORKER") {
      if (!access_code.trim()) return toast.error("Access code is required.");
      if (!worker_category_id) return toast.error("Worker category is required.");
      payload.access_code = access_code;
      payload.worker_category_id = worker_category_id;
      requestFn = authAPI.internalRegister;
    } else if (role === "VENDOR") {
      if (!company_name.trim()) return toast.error("Company name is required.");
      payload.company_name = company_name;
      requestFn = authAPI.register;
    } else if (role === "PARTNER") {
      if (!agency_name.trim()) return toast.error("Agency name is required.");
      payload.agency_name = agency_name;
      requestFn = authAPI.register;
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
      await authAPI.googleRegister({ credential });
      toast.success("Google registration successful! Redirecting...");
      setTimeout(() => navigate("/login"), 3000);
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
        <ToastContainer position="top-right" autoClose={4000} />

        {/* Left Branding Panel */}
        <div className="auth-brand-panel">
          <img src={logo} alt="Logo" className="auth-logo" />
          <h2>Ethical Multimedia GH</h2>
          <p>Empowering creatives, vendors, and partners with ethical, community-driven technology.</p>
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
                <option value="USER">Regular User</option>
                <option value="WORKER">Worker</option>
                <option value="VENDOR">Vendor</option>
                <option value="PARTNER">Partner</option>
              </select>
            </div>

            {/* Conditional Fields */}
            {form.role === "WORKER" && (
              <>
                <div className="input-group">
                  <label>Access Code</label>
                  <input
                    name="access_code"
                    value={form.access_code}
                    onChange={handleChange}
                  />
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
            {form.role === "VENDOR" && (
              <div className="input-group">
                <label>Company Name</label>
                <input
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                />
              </div>
            )}
            {form.role === "PARTNER" && (
              <div className="input-group">
                <label>Agency Name</label>
                <input
                  name="agency_name"
                  value={form.agency_name}
                  onChange={handleChange}
                />
              </div>
            )}

            {/* Common Fields */}
            <div className="input-group">
              <label>Full Name</label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>Phone</label>
              <PhoneInput
                defaultCountry="GH"
                value={form.phone}
                onChange={handlePhoneChange}
              />
            </div>
            <div className="input-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
              />
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

            {/* Password */}
            <div className="input-group password-field">
              <label>Password</label>
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setPasswordVisible((v) => !v)}
              >
                {passwordVisible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
              <div
                className={`password-strength ${passwordStrength.toLowerCase()}`}
              >
                Strength: {passwordStrength}
              </div>
            </div>

            <div className="input-group password-field">
              <label>Confirm Password</label>
              <input
                type={passwordVisible ? "text" : "password"}
                name="password2"
                value={form.password2}
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setPasswordVisible((v) => !v)}
              >
                {passwordVisible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
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
