// src/pages/auth/Register.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import axiosInstance from '../../api/axiosInstance';
import logo from '../../assets/logo.png';
import './Register.css';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    password: '',
    password2: '',
    access_code: '',
    worker_category_id: '',
    company_name: '',
    agency_name: '',
    role: 'USER',
  });

  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  useEffect(() => {
    const savedDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDark);
    document.body.classList.toggle('dark', savedDark);

    const urlCode = searchParams.get('code');
    if (urlCode) {
      setForm((prev) => ({ ...prev, access_code: urlCode, role: 'WORKER' }));
    }
  }, [searchParams]);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const getPasswordStrength = (password) => {
    if (password.length < 6) return 'Weak';
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && password.length >= 8)
      return 'Strong';
    return 'Medium';
  };

  const extractErrorMessage = (err) => {
    const data = err?.response?.data;
    if (!data) return 'Unexpected error. Please try again.';
    if (typeof data === 'string') return data;
    if (typeof data === 'object') {
      try {
        return Object.values(data).flat().join(' ');
      } catch {
        return 'Something went wrong.';
      }
    }
    return 'Something went wrong.';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleanValue = DOMPurify.sanitize(value);
    if (name === 'password') setPasswordStrength(getPasswordStrength(cleanValue));
    setForm((prev) => ({ ...prev, [name]: cleanValue }));
  };

  const handlePhoneChange = (value) => {
    setForm((prev) => ({ ...prev, phone: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      full_name,
      email,
      phone,
      dob,
      gender,
      password,
      password2,
      role,
      access_code,
      worker_category_id,
      company_name,
      agency_name,
    } = form;

    if (!full_name.trim()) return toast.error('Full name is required.');
    if (!validateEmail(email)) return toast.error('Invalid email format.');
    if (!phone || phone.length < 10) return toast.error('Enter a valid phone number.');
    if (!dob) return toast.error('Date of birth is required.');
    if (!gender) return toast.error('Gender is required.');
    if (!password) return toast.error('Password is required.');
    if (password !== password2) return toast.error('Passwords do not match.');

    const payload = {
      name: full_name,
      email,
      phone,
      dob,
      gender,
      password,
      password2,
    };

    let endpoint = '/accounts/register/';

    if (role === 'WORKER') {
      if (!access_code.trim()) return toast.error('Access code is required.');
      if (!worker_category_id) return toast.error('Worker category ID is required.');
      payload.access_code = access_code;
      payload.worker_category_id = worker_category_id;
      endpoint = '/accounts/register/worker/';
    } else if (role === 'VENDOR') {
      if (!company_name.trim()) return toast.error('Company name is required.');
      payload.company_name = company_name;
      endpoint = '/accounts/register/vendor/';
    } else if (role === 'PARTNER') {
      if (!agency_name.trim()) return toast.error('Agency name is required.');
      payload.agency_name = agency_name;
      endpoint = '/accounts/register/partner/';
    }

    setLoading(true);
    try {
      await axiosInstance.post(endpoint, payload);
      toast.success('Registration successful! Check your email to verify.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async ({ credential }) => {
    if (!credential) return toast.error('Google login failed: Missing credential');
    setLoading(true);
    try {
      await axiosInstance.post('/accounts/google-register/', { credential });
      toast.success('Google registration successful! Redirecting...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className={`register-page ${darkMode ? 'dark' : ''}`}>
        <ToastContainer autoClose={4000} />
        <div className="register-left">
          <div className="register-brand">
            <img src={logo} alt="Logo" className="register-logo" />
            <h1>Ethical Multimedia GH</h1>
            <p>
              Empowering creatives, vendors, and partners with ethical, community-driven technology. 
              Register to get started with our inclusive ecosystem.
            </p>
          </div>
        </div>

        <div className="register-right">
          <h2>Create an Account</h2>

          <form onSubmit={handleSubmit} className="register-form" noValidate>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="USER">Regular User</option>
              <option value="WORKER">Worker</option>
              <option value="VENDOR">Vendor</option>
              <option value="PARTNER">Partner</option>
            </select>

            {form.role === 'WORKER' && (
              <>
                <input
                  name="access_code"
                  placeholder="Access Code"
                  value={form.access_code}
                  onChange={handleChange}
                />
                <input
                  name="worker_category_id"
                  type="number"
                  placeholder="Worker Category ID"
                  value={form.worker_category_id}
                  onChange={handleChange}
                />
              </>
            )}

            {form.role === 'VENDOR' && (
              <input
                name="company_name"
                placeholder="Company Name"
                value={form.company_name}
                onChange={handleChange}
              />
            )}

            {form.role === 'PARTNER' && (
              <input
                name="agency_name"
                placeholder="Agency Name"
                value={form.agency_name}
                onChange={handleChange}
              />
            )}

            <input
              name="full_name"
              placeholder="Full Name"
              value={form.full_name}
              onChange={handleChange}
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />

            <PhoneInput
              defaultCountry="GH"
              value={form.phone}
              onChange={handlePhoneChange}
              placeholder="Phone number"
            />

            <input
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
            />

            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <div className="password-field">
              <input
                name="password"
                type={passwordVisible ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
              />
              <span onClick={() => setPasswordVisible((v) => !v)}>
                {passwordVisible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>

            <div className={`password-strength ${passwordStrength.toLowerCase()}`}>
              Password Strength: {passwordStrength}
            </div>

            <div className="password-field">
              <input
                name="password2"
                type={passwordVisible ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={form.password2}
                onChange={handleChange}
              />
              <span onClick={() => setPasswordVisible((v) => !v)}>
                {passwordVisible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Registering…' : 'Register'}
            </button>
          </form>

          <div className="google-signup">
            <p>Or register with Google:</p>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google sign-up failed.')}
              useOneTap
            />
          </div>

          <div className="login-prompt">
            Already have an account?{' '}
            <span onClick={() => navigate('/login')} role="button" tabIndex={0}>
              Login
            </span>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Register;
