// src/pages/auth/ResetPassword.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import './ForgotResetPassword.css';

import authAPI from '../../api/authAPI';

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [reNewPassword, setReNewPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const getPasswordStrength = (password) => {
    if (password.length < 6) return 'Weak';
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && password.length >= 8) return 'Strong';
    return 'Medium';
  };

  const extractErrorMessage = (err) => {
    const data = err?.response?.data;
    if (!data) return 'Unexpected error. Please try again.';

    if (data.errors && typeof data.errors === 'object') {
      return Object.entries(data.errors)
        .map(([field, messages]) => `${field}: ${messages.join(' ')}`)
        .join('\n');
    }

    if (typeof data === 'object') {
      return Object.entries(data)
        .map(([field, messages]) =>
          `${field}: ${Array.isArray(messages) ? messages.join(' ') : messages}`
        )
        .join('\n');
    }

    if (typeof data === 'string') return data;

    return 'An error occurred. Please try again.';
  };

  const handlePasswordChange = (value) => {
    const cleanValue = DOMPurify.sanitize(value);
    setNewPassword(cleanValue);
    setPasswordStrength(getPasswordStrength(cleanValue));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== reNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPasswordConfirm(uid, token, { password: newPassword });

      setMessage('✅ Password has been reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <form className="forgot-password-form" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>

        {message && <p className="form-message success">{message}</p>}
        {error && <p className="form-message error">{error}</p>}

        <div className="form-group password-field">
          <input
            type={passwordVisible ? 'text' : 'password'}
            placeholder="New password"
            value={newPassword}
            onChange={(e) => handlePasswordChange(e.target.value)}
            required
          />
          <span onClick={() => setPasswordVisible((v) => !v)}>
            {passwordVisible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </span>
        </div>

        {newPassword && (
          <div className={`password-strength ${passwordStrength.toLowerCase()}`}>
            Password Strength: {passwordStrength}
          </div>
        )}

        <div className="form-group password-field">
          <input
            type={passwordVisible ? 'text' : 'password'}
            placeholder="Confirm new password"
            value={reNewPassword}
            onChange={(e) => setReNewPassword(DOMPurify.sanitize(e.target.value))}
            required
          />
          <span onClick={() => setPasswordVisible((v) => !v)}>
            {passwordVisible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </span>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
