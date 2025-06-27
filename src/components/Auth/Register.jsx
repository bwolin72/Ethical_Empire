import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../../api/axiosInstance';
import logo from '../../assets/logo.png';
import './Register.css';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    username: '',
    email: '',
    phone_number: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
    role: 'USER',
    access_code: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Autofill access_code and role from query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('access_code');
    const role = params.get('role');

    if (code && role) {
      setForm(prev => ({
        ...prev,
        role: role.toUpperCase(),
        access_code: code
      }));
    }
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: DOMPurify.sanitize(value) }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { password, password2, role, access_code } = form;

    if (password !== password2) {
      setError('Passwords do not match.');
      return;
    }

    if (['ADMIN', 'WORKER'].includes(role) && !access_code) {
      setError('Access code is required for ADMIN or WORKER registration.');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form };
      delete payload.password2;

      if (role === 'USER') delete payload.access_code;

      await axiosInstance.post('register/', payload);  // Updated URL
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Register error:', err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Registration failed. Please check your input and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { credential } = response;
      await axiosInstance.post('auth/google-register/', {
        token: credential,
      }); // Updated URL

      setSuccess('Google registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Google sign-up error:', err);
      setError('Google sign-up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className={`register-container ${darkMode ? 'dark' : ''}`}>
        <div className="register-box">
          <div className="brand-header">
            <img src={logo} alt="Logo" />
            <span>Ethical Multimedia GH</span>
          </div>

          <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>

          <h2>Create an Account</h2>

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <form onSubmit={handleSubmit} className="register-form" noValidate>
            <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <input name="phone_number" placeholder="Phone Number" value={form.phone_number} onChange={handleChange} required />
            <input name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} required />
            <input name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} required />

            <select name="role" value={form.role} onChange={handleChange} required>
              <option value="USER">Client</option>
              <option value="WORKER">Internal (Worker)</option>
              <option value="ADMIN">Admin</option>
            </select>

            {['WORKER', 'ADMIN'].includes(form.role) && (
              <input
                name="access_code"
                placeholder="Access Code"
                value={form.access_code}
                onChange={handleChange}
                required
              />
            )}

            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
            <input name="password2" type="password" placeholder="Confirm Password" value={form.password2} onChange={handleChange} required />

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
            Already have an account?{' '}
            <span onClick={() => navigate('/login')}>Login</span>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Register;
