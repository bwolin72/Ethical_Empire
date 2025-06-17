// src/components/Auth/Register.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import axiosInstance from '../../api/axiosInstance';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import './Register.css';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone_number: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const safeValue = DOMPurify.sanitize(e.target.value);
    setForm((prev) => ({ ...prev, [e.target.name]: safeValue }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.password2) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axiosInstance.post('/api/accounts/register/', form);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Registration failed due to server error.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const decoded = jwtDecode(credential);

      const payload = {
        token: credential,
        email: decoded.email,
        first_name: decoded.given_name,
        last_name: decoded.family_name,
        username: decoded.email.split('@')[0],
      };

      await axiosInstance.post('/api/auth/google-signup/', payload);

      setSuccess('Google registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Google signup error:', err);
      setError('Google sign-up failed. Please try again.');
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className={`register-container ${darkMode ? 'dark' : ''}`}>
        <div className="register-box">
          <div className="brand-header">
            <img src={require('../../assets/logo.png')} alt="Logo" />
            <span>Ethical Multimedia GH</span>
          </div>

          <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>

          <h2>Register</h2>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <form onSubmit={handleSubmit} className="register-form" noValidate>
            <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <input name="phone_number" placeholder="Phone Number" value={form.phone_number} onChange={handleChange} required />
            <input name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} required />
            <input name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} required />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
            <input name="password2" type="password" placeholder="Confirm Password" value={form.password2} onChange={handleChange} required />

            <button type="submit" className="register-button" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="google-signup">
            <p>Or register with Google:</p>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign-up failed')}
              useOneTap
            />
          </div>

          <div className="login-prompt">
            Already have an account?{' '}
            <span onClick={() => navigate('/login')}>
              Login
            </span>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Register;
