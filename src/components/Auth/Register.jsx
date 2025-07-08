import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

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
    accessCode: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
      setForm((prev) => ({ ...prev, accessCode: urlCode }));
    }
  }, [searchParams]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const getPasswordStrength = (password) => {
    if (password.length < 6) return 'Weak';
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && password.length >= 8) return 'Strong';
    return 'Medium';
  };

  const extractErrorMessage = (err) => {
    const data = err?.response?.data;
    if (!data) return 'Unexpected error. Please try again.';
    if (typeof data === 'string') return data;
    return (
      data?.message ||
      data?.detail ||
      data?.error ||
      Object.values(data).flat().join(' ') ||
      'Something went wrong. Please try again.'
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleanValue = DOMPurify.sanitize(value);
    if (name === 'password') setPasswordStrength(getPasswordStrength(cleanValue));
    setForm((prev) => ({ ...prev, [name]: cleanValue }));
    setError('');
    setSuccess('');
  };

  const handlePhoneChange = (value) => {
    setForm((prev) => ({ ...prev, phone: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { full_name, email, phone, dob, gender, password, password2, accessCode } = form;

    if (!full_name.trim()) return setError('Full name is required.');
    if (!validateEmail(email)) return setError('Invalid email format.');
    if (!phone || phone.length < 10) return setError('Enter a valid phone number.');
    if (!dob) return setError('Date of birth is required.');
    if (!gender) return setError('Gender is required.');
    if (!password) return setError('Password is required.');
    if (password !== password2) return setError('Passwords do not match.');
    if (isInternal && !accessCode.trim()) return setError('Access code is required.');

    const payload = {
      full_name,
      email,
      phone,
      dob,
      gender,
      password,
      ...(isInternal ? { access_code: accessCode } : {}),
    };

    const endpoint = isInternal
      ? '/accounts/internal-register/'
      : '/accounts/register/';

    setLoading(true);
    try {
      const response = await axiosInstance.post(endpoint, payload);
      setSuccess('Registration successful! Please check your email to verify.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async ({ credential }) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const decoded = jwtDecode(credential);
      const { email, name } = decoded;

      await axiosInstance.post('/accounts/google-register/', {
        email,
        full_name: name,
      });

      setSuccess('Google registration successful! Redirecting...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(extractErrorMessage(err));
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
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <form onSubmit={handleSubmit} className="register-form" noValidate>
            {isInternal && (
              <input
                name="accessCode"
                placeholder="Access Code"
                value={form.accessCode}
                onChange={handleChange}
              />
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
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>

            <div className="password-field">
              <input
                name="password"
                type={passwordVisible ? 'text' : 'password'}
                placeholder="Password"
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
              onError={() => setError('Google sign-up failed.')}
              useOneTap
            />
          </div>

          <div className="login-prompt">
            Already have an account? <span onClick={() => navigate('/login')}>Login</span>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Register;
