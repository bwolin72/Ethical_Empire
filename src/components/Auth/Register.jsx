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
  const [accessLocked, setAccessLocked] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  const isStaff = ['WORKER', 'ADMIN'].includes(form.role);
  const isAdmin = form.role === 'ADMIN';

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const role = params.get('role');
    const code = params.get('access_code');

    if (role) {
      setForm((prev) => ({
        ...prev,
        role: role.toUpperCase(),
        access_code: code || '',
      }));
      if (code) setAccessLocked(true);
    }

    const saved = localStorage.getItem('darkMode') === 'true';
    setDarkMode(saved);
    document.body.classList.toggle('dark-mode', saved);
  }, [location.search]);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePhone = (phone) =>
    /^0\d{9}$/.test(phone);

  const getPasswordStrength = (password) => {
    if (password.length < 6) return 'Weak';
    if (password.match(/[A-Z]/) && password.match(/[0-9]/) && password.length >= 8)
      return 'Strong';
    return 'Medium';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = DOMPurify.sanitize(value);

    if (name === 'password') {
      setPasswordStrength(getPasswordStrength(sanitizedValue));
    }

    setForm((prev) => ({ ...prev, [name]: sanitizedValue }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { email, phone_number, password, password2, role, access_code } = form;

    if (!validateEmail(email)) {
      setError('Invalid email format.');
      return;
    }

    if (!validatePhone(phone_number)) {
      setError('Phone number must be 10 digits and start with 0.');
      return;
    }

    if (password !== password2) {
      setError('Passwords do not match.');
      return;
    }

    if (isStaff && !access_code) {
      setError('Access code is required for staff/admin registration.');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form };
      delete payload.password2;
      if (!isStaff) delete payload.access_code;

      await axiosInstance.post('/accounts/register/', payload);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.detail ||
        data?.error ||
        Object.values(data || {}).flat().join(' ') ||
        'Registration failed. Please try again.'
      );
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
        name,
      });

      setSuccess('Google registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Google sign-up failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.classList.toggle('dark-mode', newMode);
    localStorage.setItem('darkMode', newMode);
  };

  const toggleRole = () => {
    const newRole = form.role === 'USER' ? 'WORKER' : 'USER';
    setForm((prev) => ({ ...prev, role: newRole, access_code: '' }));
    setAccessLocked(false);
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className={`register-container ${darkMode ? 'dark' : ''}`}>
        <div className="register-box">
          <div className="brand-header">
            <img src={logo} alt="Logo" />
            <span>Ethical Multimedia GH</span>
          </div>

          <button className="dark-toggle" onClick={toggleDarkMode}>
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>

          {!isAdmin && (
            <div className="role-toggle">
              <button onClick={toggleRole} className="toggle-button">
                {form.role === 'USER' ? 'Register as Staff' : 'Register as Client'}
              </button>
            </div>
          )}

          <h2>Create an Account</h2>

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <form onSubmit={handleSubmit} className="register-form" noValidate>
            <input name="username" placeholder="Username" value={form.username} onChange={handleChange} />
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
            <input name="phone_number" placeholder="Phone Number" value={form.phone_number} onChange={handleChange} />
            <input name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} />
            <input name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} />

            <select name="role" value={form.role} onChange={handleChange} disabled={accessLocked || isAdmin}>
              <option value="USER">Client</option>
              <option value="WORKER">Internal (Worker)</option>
              <option value="ADMIN">Admin</option>
            </select>

            {isStaff && (
              <input
                name="access_code"
                placeholder="Access Code"
                value={form.access_code}
                onChange={handleChange}
                readOnly={accessLocked}
              />
            )}

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />
            <div className={`password-strength ${passwordStrength.toLowerCase()}`}>
              Password Strength: {passwordStrength}
            </div>

            <input
              name="password2"
              type="password"
              placeholder="Confirm Password"
              value={form.password2}
              onChange={handleChange}
            />

            <button type="submit" className="register-button" disabled={loading}>
              {loading ? 'Registering…' : 'Register'}
            </button>
          </form>

          {form.role === 'USER' && (
            <div className="google-signup">
              <p>Or register with Google:</p>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-up failed.')}
                useOneTap
              />
            </div>
          )}

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
