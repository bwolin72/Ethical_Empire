// src/components/Auth/Login.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
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

  const redirectByRole = useCallback((role) => {
    console.log(`[Login] Redirecting based on role: ${role}`);
    const routes = {
      admin: '/admin',
      worker: '/worker',
      user: '/user',
    };
    navigate(routes[role] || '/user', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const savedDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDark);
    document.body.classList.toggle('dark-mode', savedDark);
  }, []);

  useEffect(() => {
    if (!ready || hasRedirected || !user) return;
    console.log('[Login] Auth is ready, user found. Redirecting...');
    setHasRedirected(true);
    redirectByRole(user.role);
  }, [ready, user, hasRedirected, redirectByRole]);

  const toggleDarkMode = () => {
    const updated = !darkMode;
    console.log(`[Login] Dark mode toggled: ${updated}`);
    setDarkMode(updated);
    document.body.classList.toggle('dark-mode', updated);
    localStorage.setItem('darkMode', updated);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
    setError('');
  };

  const validateForm = () => {
    const errors = {};
    if (!form.email.trim()) errors.email = 'Email is required';
    if (!form.password.trim()) errors.password = 'Password is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const extractErrorMessage = (err) => {
    console.error('[Login] Extracting error from response:', err?.response);
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
        'Login failed. Please try again.'
      );
    }
    return 'Login failed. Please try again.';
  };

  const handleLoginSuccess = (data) => {
    console.log('[Login] Login successful. Response:', data);
    const { access, refresh, user } = data;

    if (!access || !refresh || !user) {
      console.warn('[Login] Incomplete login response:', { access, refresh, user });
      setError('Login failed. Incomplete server response.');
      return;
    }

    const userPayload = {
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.role === 'admin',
      is_email_verified: user.is_email_verified,
    };

    login({
      access,
      refresh,
      user: userPayload,
      remember: rememberMe,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    console.log('[Login] Submitting login form:', form);
    try {
      const { data } = await axiosInstance.post('/accounts/login/', form);
      handleLoginSuccess(data);
    } catch (err) {
      const msg = extractErrorMessage(err);
      console.error('[Login] Login failed:', msg);
      setError(msg);
      localStorage.clear();
      sessionStorage.clear();
      setForm((prev) => ({ ...prev, password: '' }));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async ({ credential }) => {
    if (!credential) {
      console.error('[Login] Google login failed: Missing credential');
      setError('Google login failed: Missing credential');
      return;
    }
    setLoading(true);
    console.log('[Login] Google credential received. Sending to backend...');
    try {
      const { data } = await axiosInstance.post('/accounts/google-login/', { credential });
      handleLoginSuccess(data);
    } catch (err) {
      const msg = extractErrorMessage(err);
      console.error('[Login] Google login failed:', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="login-container">
        <div className="login-box">
          <img src={logo} alt="Logo" className="login-logo" />
          <h2>Eethm_GH</h2>
          <h3>Ethical Multimedia GH</h3>

          <label className="dark-toggle">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={toggleDarkMode}
              aria-label="Toggle dark mode"
            />
            Dark Mode
          </label>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              autoComplete="username"
              className={formErrors.email ? 'input-error' : ''}
              disabled={loading}
              required
            />
            {formErrors.email && <small>{formErrors.email}</small>}

            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                className={formErrors.password ? 'input-error' : ''}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {formErrors.password && <small>{formErrors.password}</small>}

            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              Remember Me
            </label>

            <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>

          <div className="social-buttons">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                console.error('[Login] Google button error callback');
                setError('Google login failed');
              }}
              useOneTap
              theme="outline"
              size="large"
            />
          </div>

          <p className="register-prompt">
            Don’t have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
