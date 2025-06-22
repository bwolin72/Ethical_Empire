import React, { useState } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import logo from '../../assets/logo.png';
import './Login.css';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Username is required';
    if (!form.password.trim()) errs.password = 'Password is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setFormErrors({ ...formErrors, [e.target.name]: '' });
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.body.classList.toggle('dark-mode', next);
  };

  const redirectByRole = (role) => {
    switch (role) {
      case 'ADMIN':
        navigate('/admin', { replace: true });
        break;
      case 'WORKER':
        navigate('/worker', { replace: true });
        break;
      default:
        navigate('/user', { replace: true });
    }
  };

  const handleLoginSuccess = (access, refresh, username, role) => {
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);

    login({
      access,
      refresh,
      username,
      isAdmin: role === 'ADMIN',
    });

    redirectByRole(role);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);

    try {
      const { data } = await axiosInstance.post('/user-account/auth/jwt/create/', {
        username: form.username,
        password: form.password,
      });

      const { access, refresh } = data;
      if (!access || !refresh) throw new Error('No tokens returned.');

      const userRes = await axiosInstance.get('/user-account/user-role/');
      const { username, role } = userRes.data;

      handleLoginSuccess(access, refresh, username, role);
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        'Login failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credResp) => {
    setError('');
    setLoading(true);
    try {
      const { credential } = credResp;
      const decoded = jwtDecode(credential);
      console.log('Google JWT payload:', decoded);

      const { data } = await axiosInstance.post('/user-account/auth/google-login/', {
        token: credential,
      });

      const { access, refresh, username, role } = data;
      handleLoginSuccess(access, refresh, username, role);
    } catch (err) {
      console.error('Google login error:', err);
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="login-container">
        <div className="login-box">
          <img src={logo} alt="Logo" className="login-logo" />
          <h2>Login</h2>

          <label className="dark-toggle">
            <input type="checkbox" onChange={toggleDarkMode} checked={darkMode} />
            Dark Mode
          </label>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <input
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className={formErrors.username ? 'input-error' : ''}
            />
            {formErrors.username && (
              <small className="input-feedback">{formErrors.username}</small>
            )}

            <div className="password-input">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className={formErrors.password ? 'input-error' : ''}
              />
              <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
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
              onError={() => setError('Google login was unsuccessful')}
              useOneTap
            />
          </div>

          <p className="register-prompt">
            Don’t have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
