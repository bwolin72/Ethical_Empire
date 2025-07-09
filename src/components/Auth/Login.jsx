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
  const [hasRedirected, setHasRedirected] = useState(false);

  const navigate = useNavigate();
  const { login, auth } = useAuth();
  const user = auth?.user;

  const redirectByRole = useCallback((role) => {
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

  // ✅ FIXED: Clean, safe redirect logic
  useEffect(() => {
    if (!user || hasRedirected) return;
    setHasRedirected(true);
    redirectByRole(user.role);
  }, [user, redirectByRole, hasRedirected]);

  const toggleDarkMode = () => {
    const updated = !darkMode;
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
    const data = err.response?.data;
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

  const handleLoginSuccess = ({ tokens, user }) => {
    if (!tokens?.access || !tokens?.refresh || !user) {
      setError('Login failed. Invalid response from server.');
      return;
    }

    const userPayload = {
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.role === 'admin',
    };

    localStorage.setItem('access', tokens.access);
    localStorage.setItem('refresh', tokens.refresh);
    localStorage.setItem('user', JSON.stringify(userPayload));

    login({ access: tokens.access, refresh: tokens.refresh, user: userPayload });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/accounts/login/', form);
      handleLoginSuccess(data);
    } catch (err) {
      setError(extractErrorMessage(err));
      localStorage.clear();
      setForm((prev) => ({ ...prev, password: '' }));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async ({ credential }) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/accounts/google-register/', {
        credential,
      });
      handleLoginSuccess(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="login-container">
        <div className="login-box">
          <img src={logo} alt="Logo" className="login-logo" />
          <h2>MyCompany Portal</h2>
          <p style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Secure login for employees and administrators.
          </p>

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
              className={formErrors.email ? 'input-error' : ''}
              disabled={loading}
              aria-invalid={!!formErrors.email}
            />
            {formErrors.email && <small className="input-feedback">{formErrors.email}</small>}

            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className={formErrors.password ? 'input-error' : ''}
                disabled={loading}
                aria-invalid={!!formErrors.password}
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
            {formErrors.password && (
              <small className="input-feedback">{formErrors.password}</small>
            )}

            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>

          <div className="social-buttons">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google login failed')}
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
