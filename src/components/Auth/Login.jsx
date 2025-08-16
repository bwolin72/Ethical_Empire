// src/components/auth/Login.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import authAPI from '../../api/authAPI';   // ✅ Correct import path
import { useAuth } from '../context/AuthContext';
import logo from '../../assets/logo.png';
import './Login.css';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  const navigate = useNavigate();
  const { login, auth, ready } = useAuth();
  const user = auth?.user;

  // ===== Redirect by role =====
  const redirectByRole = useCallback((role) => {
    const routes = {
      admin: '/admin',
      worker: '/worker',
      user: '/user',
      vendor: '/vendor-profile',
      partner: '/partner-profile',
    };
    navigate(routes[role] || '/user', { replace: true });
  }, [navigate]);

  // ===== Dark mode init =====
  useEffect(() => {
    const savedDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDark);
    document.body.classList.toggle('dark', savedDark);
  }, []);

  // ===== Redirect if already logged in =====
  useEffect(() => {
    if (!ready || hasRedirected || !user) return;
    setHasRedirected(true);
    redirectByRole(user.role);
  }, [ready, user, hasRedirected, redirectByRole]);

  // ===== Toggle dark mode =====
  const toggleDarkMode = () => {
    const updated = !darkMode;
    setDarkMode(updated);
    document.body.classList.toggle('dark', updated);
    localStorage.setItem('darkMode', updated);
  };

  // ===== Handle input change =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
    setError('');
  };

  // ===== Validate form =====
  const validateForm = () => {
    const errors = {};
    if (!form.email.trim()) errors.email = 'Please enter your email address.';
    if (!form.password.trim()) errors.password = 'Please enter your password.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ===== Extract error message from backend =====
  const extractErrorMessage = (err) => {
    const data = err?.response?.data;
    if (typeof data === 'string') return data;
    if (Array.isArray(data)) return data[0];
    if (typeof data === 'object') {
      return (
        data.message ||
        data.detail ||
        data.error?.non_field_errors?.[0] ||
        data.error?.email?.[0] ||
        data.error?.password?.[0] ||
        Object.values(data.error || {})[0] ||
        'Oops! Something went wrong. Please try again.'
      );
    }
    return 'Oops! Something went wrong. Please try again.';
  };

  // ===== Handle login success =====
  const handleLoginSuccess = (data) => {
    const { access, refresh, user } = data;

    if (!access || !refresh || !user) {
      setError('Login failed. Server returned incomplete data.');
      return;
    }

    const userPayload = {
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.role === 'admin',
      is_email_verified: user.is_email_verified,
    };

    login({ access, refresh, user: userPayload, remember: rememberMe });
  };

  // ===== Handle form submit (email/password login) =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data } = await authAPI.login(form);   // ✅ Using authAPI
      handleLoginSuccess(data);
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg);
      localStorage.clear();
      sessionStorage.clear();
      setForm((prev) => ({ ...prev, password: '' }));
    } finally {
      setLoading(false);
    }
  };

  // ===== Handle Google OAuth login =====
  const handleGoogleSuccess = async ({ credential }) => {
    if (!credential) {
      setError('Google login failed. Missing credentials.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axiosInstance.post(authAPI.endpoints.googleLogin, { credential });  
      handleLoginSuccess(data);
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="login-page">
        {/* ==== Left Side Branding ==== */}
        <div className="login-left">
          <div className="login-brand">
            <img src={logo} alt="Ethical Multimedia Logo" />
            <h1>Eethm_GH</h1>
            <p>Your Trusted Digital Hub in Ghana</p>
          </div>
        </div>

        {/* ==== Right Side Form ==== */}
        <div className="login-right">
          <h2>Welcome Back 👋</h2>
          <p className="login-subtext">Log in to continue exploring our services</p>

          <label className="dark-toggle">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={toggleDarkMode}
              aria-label="Toggle dark mode"
            />
            Enable Dark Mode
          </label>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="username"
              className={formErrors.email ? 'input-error' : ''}
              disabled={loading}
              required
            />
            {formErrors.email && <small>{formErrors.email}</small>}

            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                className={formErrors.password ? 'input-error' : ''}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {formErrors.password && <small>{formErrors.password}</small>}

            <div className="login-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Keep me signed in
              </label>

              <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* ==== Google Login ==== */}
          <div className="google-signup">
            <p>Or sign in using your Google account</p>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google login failed')}
              useOneTap
              theme="outline"
              size="large"
            />
          </div>

          <p className="register-prompt">
            Don’t have an account?{' '}
            <Link to="/register">Create one now</Link>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
