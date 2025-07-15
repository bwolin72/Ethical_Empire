// src/pages/auth/Register.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import axiosInstance from '../../api/axiosInstance';
import logo from '../../assets/logo.png';
import './Register.css';

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
    role: 'USER',
  });

  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  useEffect(() => {
    const savedDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDark);
    document.body.classList.toggle('dark', savedDark);

    const urlCode = searchParams.get('code');
    if (urlCode) {
      setIsInternal(true);
      setForm((prev) => ({ ...prev, access_code: urlCode }));
    }
  }, [searchParams]);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const getPasswordStrength = (password) => {
    if (password.length < 6) return 'Weak';
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && password.length >= 8)
      return 'Strong';
    return 'Medium';
  };

  const extractErrorMessage = (err) => {
    const data = err?.response?.data;
    if (!data) return 'Unexpected error. Please try again.';
    if (typeof data === 'string') return data;
    if (typeof data === 'object') {
      try {
        return Object.values(data).flat().join(' ');
      } catch {
        return 'Something went wrong.';
      }
    }
    return 'Something went wrong. Please try again.';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleanValue = DOMPurify.sanitize(value);
    if (name === 'password') setPasswordStrength(getPasswordStrength(cleanValue));
    setForm((prev) => ({ ...prev, [name]: cleanValue }));
  };

  const handlePhoneChange = (value) => {
    setForm((prev) => ({ ...prev, phone: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      full_name,
      email,
      phone,
      dob,
      gender,
      password,
      password2,
      access_code,
      worker_category_id,
    } = form;

    if (!full_name.trim()) return toast.error('Full name is required.');
    if (!validateEmail(email)) return toast.error('Invalid email format.');
    if (!phone || phone.length < 10) return toast.error('Enter a valid phone number.');
    if (!dob) return toast.error('Date of birth is required.');
    if (!gender) return toast.error('Gender is required.');
    if (!password) return toast.error('Password is required.');
    if (password !== password2) return toast.error('Passwords do not match.');

    const payload = {
      name: full_name,
      email,
      phone,
      dob,
      gender,
      password,
      password2,
    };

    if (isInternal) {
      if (!access_code.trim()) return toast.error('Access code is required.');
      if (!worker_category_id) return toast.error('Worker category ID is required.');
      payload.access_code = access_code;
      payload.worker_category_id = worker_category_id;
      payload.role = 'WORKER';
    }

    setLoading(true);
    try {
      await axiosInstance.post('/accounts/register/', payload);
      toast.success('Registration successful! Check your email to verify.');
      setTimeout(() => navigate('/login'), 3000);
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
      await axiosInstance.post('/accounts/google-register/', { credential });
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
      <div className={`register-container ${darkMode ? 'dark' : ''}`}>
        <ToastContainer autoClose={4000} />
        <div className="register-box">
          <div className="brand-header">
            <img src={logo} alt="Logo" />
            <span>Ethical Multimedia GH</span>
          </div>

          <p className="register-subtitle">
            Join the Ethical Multimedia GH platform. Empower your creative journey with ethical tech.
          </p>

          <div className="top-controls">
            <button className="dark-toggle" onClick={toggleDarkMode}>
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
            <label className="internal-toggle">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
              />
              Internal
            </label>
          </div>

          <h2>{isInternal ? 'Internal Registration' : 'Create an Account'}</h2>

          <form onSubmit={handleSubmit} className="register-form" noValidate>
            {isInternal && (
              <>
                <input
                  name="access_code"
                  placeholder="Access Code"
                  value={form.access_code}
                  onChange={handleChange}
                />
                <input
                  name="worker_category_id"
                  type="number"
                  placeholder="Worker Category ID"
                  value={form.worker_category_id}
                  onChange={handleChange}
                />
              </>
            )}

            <input
              name="full_name"
              placeholder="Full Name"
              value={form.full_name}
              onChange={handleChange}
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />

            <div className="form-row">
              <PhoneInput
                defaultCountry="GH"
                value={form.phone}
                onChange={handlePhoneChange}
                placeholder="Phone number"
                className="phone-input"
              />
              <div className="dob-group">
                <label htmlFor="dob" className="dob-label">
                  Date of Birth
                </label>
                <input
                  name="dob"
                  type="date"
                  id="dob"
                  value={form.dob}
                  onChange={handleChange}
                />
              </div>
            </div>

            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <div className="password-field">
              <input
                name="password"
                type={passwordVisible ? 'text' : 'password'}
                placeholder="Password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
              />
              <span onClick={() => setPasswordVisible((v) => !v)} className="toggle-password">
                {passwordVisible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>

            <div className={`password-strength ${passwordStrength.toLowerCase()}`}>
              Password Strength: {passwordStrength}
            </div>

            <div className="password-field">
              <input
                name="password2"
                type={passwordVisible ? 'text' : 'password'}
                placeholder="Confirm Password"
                autoComplete="new-password"
                value={form.password2}
                onChange={handleChange}
              />
              <span onClick={() => setPasswordVisible((v) => !v)} className="toggle-password">
                {passwordVisible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>

            <button type="submit" className="register-button" disabled={loading}>
              {loading ? 'Registering…' : 'Register'}
            </button>
          </form>

          <div className="google-signup">
            <p>Or register with Google:</p>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google sign-up failed.')}
              useOneTap
            />
          </div>

          <div className="login-prompt">
            Already have an account?{' '}
            <span onClick={() => navigate('/login')} role="button" tabIndex={0}>
              Login
            </span>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Register;
