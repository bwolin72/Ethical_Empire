import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import authAPI from '../../api/authAPI';
import logo from '../../assets/logo.png';
import './Auth.css';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    password: '',
    password2: '',
    access_code: '',
    worker_category_id: '',
    company_name: '',
    agency_name: '',
    role: 'USER',
    acceptTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  useEffect(() => {
    const savedDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDark);
    document.body.classList.toggle('dark', savedDark);

    const urlCode = searchParams.get('code');
    if (urlCode) {
      setForm((prev) => ({ ...prev, access_code: urlCode, role: 'WORKER' }));
    }
  }, [searchParams]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const getPasswordStrength = (password) => {
    if (password.length < 6) return 'Weak';
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && password.length >= 8)
      return 'Strong';
    return 'Medium';
  };
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const extractErrorMessage = (err) => {
    const data = err?.response?.data;
    if (!data) return 'Unexpected error. Please try again.';
    if (data.errors && typeof data.errors === 'object') {
      return Object.entries(data.errors)
        .map(([field, messages]) => `${capitalize(field)}: ${messages.join(' ')}`)
        .join('\n');
    }
    if (typeof data === 'object') {
      return Object.entries(data)
        .map(([field, messages]) =>
          `${capitalize(field)}: ${Array.isArray(messages) ? messages.join(' ') : messages}`
        )
        .join('\n');
    }
    if (typeof data === 'string') return data;
    return 'An error occurred. Please check your input.';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const cleanValue = DOMPurify.sanitize(value);

    if (name === 'password') setPasswordStrength(getPasswordStrength(cleanValue));
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: cleanValue }));
    }
  };

  const handlePhoneChange = (value) => {
    setForm((prev) => ({ ...prev, phone: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Keep toast UX for register, but we validate things before calling API
    if (!form.acceptTerms) {
      toast.error('❌ You must accept our Terms & Privacy Policy.');
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

    if (!full_name.trim()) return toast.error('Full name is required.');
    if (!validateEmail(email)) return toast.error('Invalid email format.');
    if (!phone || phone.length < 10) return toast.error('Enter a valid phone number.');
    if (!dob) return toast.error('Date of birth is required.');
    if (!gender) return toast.error('Gender is required.');
    if (!password) return toast.error('Password is required.');
    if (password !== password2) return toast.error('Passwords do not match.');

    const payload = { name: full_name, email, phone, dob, gender, password, password2 };
    let requestFn = authAPI.register;

    if (role === 'WORKER') {
      if (!access_code.trim()) return toast.error('Access code is required.');
      if (!worker_category_id) return toast.error('Worker category ID is required.');
      payload.access_code = access_code;
      payload.worker_category_id = worker_category_id;
      requestFn = authAPI.internalRegister;
    } else if (role === 'VENDOR') {
      if (!company_name.trim()) return toast.error('Company name is required.');
      payload.company_name = company_name;
      requestFn = (data) => authAPI.register({ ...data, role: 'VENDOR' });
    } else if (role === 'PARTNER') {
      if (!agency_name.trim()) return toast.error('Agency name is required.');
      payload.agency_name = agency_name;
      requestFn = (data) => authAPI.register({ ...data, role: 'PARTNER' });
    }

    setLoading(true);
    try {
      const res = await requestFn(payload);
      const { email: returnedEmail, phone: returnedPhone } = res.data;
      toast.success('✅ Verification code sent. Check your email and SMS.');
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
    if (!credential) return toast.error('Google login failed: Missing credential');
    setLoading(true);
    try {
      await authAPI.googleRegister({ credential });
      toast.success('Google registration successful! Redirecting...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const updated = !darkMode;
    setDarkMode(updated);
    document.body.classList.toggle('dark', updated);
    localStorage.setItem('darkMode', updated);
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className={`auth-page ${darkMode ? 'dark' : ''}`}>
        <ToastContainer position="top-right" autoClose={4000} />

        <div className="auth-left">
          <div className="auth-brand">
            <img src={logo} alt="Logo" />
            <h1>Ethical Multimedia GH</h1>
            <p>Empowering creatives, vendors, and partners with ethical, community-driven technology.</p>
          </div>
        </div>

        <div className="auth-right">
          <h2>Create an Account</h2>

          <label className="dark-toggle">
            <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
            Enable Dark Mode
          </label>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Account Type */}
            <div className="form-group">
              <label htmlFor="role">Account Type</label>
              <select id="role" name="role" value={form.role} onChange={handleChange}>
                <option value="USER">Regular User</option>
                <option value="WORKER">Worker</option>
                <option value="VENDOR">Vendor</option>
                <option value="PARTNER">Partner</option>
              </select>
            </div>

            {/* Conditional Fields */}
            {form.role === 'WORKER' && (
              <>
                <div className="form-group">
                  <label htmlFor="access_code">Access Code</label>
                  <input id="access_code" name="access_code" value={form.access_code} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="worker_category_id">Worker Category ID</label>
                  <input id="worker_category_id" name="worker_category_id" type="number" value={form.worker_category_id} onChange={handleChange} />
                </div>
              </>
            )}
            {form.role === 'VENDOR' && (
              <div className="form-group">
                <label htmlFor="company_name">Company Name</label>
                <input id="company_name" name="company_name" value={form.company_name} onChange={handleChange} />
              </div>
            )}
            {form.role === 'PARTNER' && (
              <div className="form-group">
                <label htmlFor="agency_name">Agency Name</label>
                <input id="agency_name" name="agency_name" value={form.agency_name} onChange={handleChange} />
              </div>
            )}

            {/* Common Fields */}
            <div className="form-group">
              <label htmlFor="full_name">Full Name</label>
              <input id="full_name" name="full_name" value={form.full_name} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <PhoneInput id="phone" defaultCountry="GH" value={form.phone} onChange={handlePhoneChange} />
            </div>

            <div className="form-group">
              <label htmlFor="dob">Date of Birth</label>
              <input id="dob" name="dob" type="date" value={form.dob} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select id="gender" name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Password Fields */}
            <div className="form-group password-field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type={passwordVisible ? 'text' : 'password'} value={form.password} onChange={handleChange} />
              <button
                type="button"
                className="toggle-password"
                aria-pressed={passwordVisible}
                aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                onClick={() => setPasswordVisible((v) => !v)}
              >
                {passwordVisible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
              <div className={`password-strength ${passwordStrength.toLowerCase()}`}>
                Password Strength: {passwordStrength}
              </div>
            </div>

            <div className="form-group password-field">
              <label htmlFor="password2">Confirm Password</label>
              <input id="password2" name="password2" type={passwordVisible ? 'text' : 'password'} value={form.password2} onChange={handleChange} />
              <button
                type="button"
                className="toggle-password"
                aria-pressed={passwordVisible}
                aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                onClick={() => setPasswordVisible((v) => !v)}
              >
                {passwordVisible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>

            {/* Terms & Privacy */}
            <label className="terms-checkbox">
              <input type="checkbox" name="acceptTerms" checked={form.acceptTerms} onChange={handleChange} />
              I accept the <Link to="/terms">Terms & Conditions</Link> and <Link to="/privacy">Privacy Policy</Link>
            </label>

            <button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          {/* Google SignUp */}
          <div className="google-signup">
            <p>Or register with Google:</p>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error('Google sign-up failed.')} useOneTap />
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
