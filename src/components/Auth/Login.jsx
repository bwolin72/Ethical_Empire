import React, { useState, useEffect, useCallback } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import logo from '../../assets/logo.png';
import './Login.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false); // 👈 New state

  const navigate = useNavigate();
  const { login, auth } = useAuth();
  const user = auth?.user;
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

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

  useEffect(() => {
    if (user?.role && !hasRedirected) {
      redirectByRole(user.role);
      setHasRedirected(true); // ✅ Prevents re-triggering
    }
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
    return data?.message || data?.detail || data?.error || 'Login failed. Please try again.';
  };

  const handleLoginSuccess = (data) => {
    const { tokens, user } = data;
    const access = tokens?.access;
    const refresh = tokens?.refresh;

    if (!access || !refresh || !user) {
      setError('Login failed. Invalid response from server.');
      return;
    }

    const userPayload = {
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.role === 'admin',
    };

    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    localStorage.setItem('user', JSON.stringify(userPayload));

    login({ access, refresh, user: userPayload });
    redirectByRole(user.role);
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
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('user');
      setForm((prev) => ({ ...prev, password: '' }));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async ({ credential }) => {
    setLoading(true);
    try {
      const decoded = jwtDecode(credential);
      const loginData = {
        email: decoded.email,
        password: decoded.sub,
      };

      try {
        const { data } = await axiosInstance.post('/accounts/login/', loginData);
        handleLoginSuccess(data);
      } catch {
        const { data } = await axiosInstance.post('/accounts/google-register/', {
          email: decoded.email,
          name: decoded.name,
        });
        handleLoginSuccess(data);
      }
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
