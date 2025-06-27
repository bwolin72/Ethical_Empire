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
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = () => {
    const errors = {};
    if (!form.username.trim()) errors.username = 'Username is required';
    if (!form.password.trim()) errors.password = 'Password is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const redirectByRole = (role) => {
    const routes = {
      ADMIN: '/admin',
      WORKER: '/worker',
      USER: '/user',
    };
    navigate(routes[role] || routes.USER, { replace: true });
  };

  const handleLoginSuccess = (access, refresh, username, role) => {
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    login({ access, refresh, username, isAdmin: role === 'ADMIN' });
    redirectByRole(role);
  };

  const handleChange = ({ target: { name, value } }) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);

    try {
      const { data } = await axiosInstance.post('user-account/login/', form);
      const { access, refresh } = data;

      const userRes = await axiosInstance.get('user-account/user-role/');
      const { username, role } = userRes.data;

      handleLoginSuccess(access, refresh, username, role);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Login failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async ({ credential }) => {
    setError('');
    setLoading(true);
    try {
      const decoded = jwtDecode(credential);
      const { data } = await axiosInstance.post('user-account/auth/google-login/', {
        token: credential,
      });

      const { access, refresh, username, role } = data;
      handleLoginSuccess(access, refresh, username, role);
    } catch (err) {
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.classList.toggle('dark-mode', newMode);
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
            {formErrors.username && <small className="input-feedback">{formErrors.username}</small>}

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
