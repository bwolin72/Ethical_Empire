import React, { useState, useEffect } from 'react';
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

  const navigate = useNavigate();
  const { login } = useAuth();
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    const savedDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDark);
    document.body.classList.toggle('dark-mode', savedDark);
  }, []);

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
    if (data?.detail) return Array.isArray(data.detail) ? data.detail[0] : data.detail;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    return 'Login failed. Please try again.';
  };

  const redirectByRole = (role) => {
    const paths = {
      admin: '/admin',
      worker: '/worker',
      user: '/user',
    };
    navigate(paths[role] || '/user', { replace: true });
  };

  const handleLoginSuccess = (access, refresh, user) => {
    if (!access || !refresh || !user) {
      console.error('Login response missing access, refresh, or user');
      setError('Login failed: Missing token or user.');
      return;
    }

    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    login({
      access,
      refresh,
      username: user.name,
      isAdmin: user.role === 'admin',
    });
    redirectByRole(user.role);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/accounts/login/', form);
      const { access, refresh, user } = data;
      handleLoginSuccess(access, refresh, user);
    } catch (err) {
      console.error(err);
      setError(extractErrorMessage(err));
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      setForm((prev) => ({ ...prev, password: '' }));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async ({ credential }) => {
    setLoading(true);
    try {
      const decoded = jwtDecode(credential);

      // Try login first if user already registered via Google
      try {
        const { data } = await axiosInstance.post('/accounts/login/', {
          email: decoded.email,
          password: decoded.sub, // NOTE: backend must handle this logic if using Google `sub` as password
        });

        const { access, refresh, user } = data;
        handleLoginSuccess(access, refresh, user);
      } catch (loginErr) {
        // If login fails, attempt Google registration
        const regResponse = await axiosInstance.post('/accounts/google-register/', {
          email: decoded.email,
          name: decoded.name,
        });

        // Assume registration returns tokens as well
        const { access, refresh, user } = regResponse.data;
        handleLoginSuccess(access, refresh, user);
      }

    } catch (err) {
      console.error('Google login error:', err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="login-container">
        <div className="login-box">
          <img src={logo} alt="App Logo" className="login-logo" />
          <h2>Login</h2>

          <label className="dark-toggle">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={toggleDarkMode}
              aria-label="Toggle dark mode"
            />
            Dark Mode
          </label>

          {error && <div className="error-message" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className={formErrors.email ? 'input-error' : ''}
              aria-invalid={!!formErrors.email}
              disabled={loading}
            />
            {formErrors.email && <small className="input-feedback">{formErrors.email}</small>}

            <div className="password-input">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className={formErrors.password ? 'input-error' : ''}
                aria-invalid={!!formErrors.password}
                disabled={loading}
              />
              <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {formErrors.password && <small className="input-feedback">{formErrors.password}</small>}

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
              onError={() => setError('Google login failed.')}
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
