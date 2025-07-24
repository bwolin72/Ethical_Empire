import React, { useState } from 'react';
import './ForgotResetPassword.css';
import axiosInstance from '../../api/axiosInstance';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [reNewPassword, setReNewPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  const getPasswordStrength = (password) => {
    if (password.length < 6) return 'Weak';
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && password.length >= 8) return 'Strong';
    return 'Medium';
  };

  const handlePasswordChange = (value) => {
    setNewPassword(value);
    setPasswordStrength(getPasswordStrength(value));
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
      await axiosInstance.post(`/user-account/auth/reset-password-confirm/${uid}/${token}/`, {
        password: newPassword,
      });

      setMessage('Password has been reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const res = err.response?.data;
      const errorMsg = Array.isArray(res?.error)
        ? res.error.join(', ')
        : res?.error || res?.detail || 'An error occurred. Please try again.';
      setError(errorMsg);
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

        <div className="password-field">
          <input
            type={passwordVisible ? 'text' : 'password'}
            placeholder="New password"
            value={newPassword}
            onChange={(e) => handlePasswordChange(e.target.value)}
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setPasswordVisible((v) => !v)}
          >
            {passwordVisible ? '🙈' : '👁️'}
          </button>
        </div>

        {newPassword && (
          <div className={`password-strength ${passwordStrength.toLowerCase()}`}>
            Password Strength: {passwordStrength}
          </div>
        )}

        <div className="password-field">
          <input
            type={passwordVisible ? 'text' : 'password'}
            placeholder="Confirm new password"
            value={reNewPassword}
            onChange={(e) => setReNewPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
