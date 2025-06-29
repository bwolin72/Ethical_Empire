import React, { useState } from 'react';
import './ForgotResetPassword.css';
import axiosInstance from '../../api/axiosInstance';
import { useParams } from 'react-router-dom';

const ResetPassword = () => {
  const { uid, token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [reNewPassword, setReNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== reNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await axiosInstance.post('/api/user-account/auth/reset-password-confirm/', {
        uid,
        token,
        new_password: newPassword,
        re_new_password: reNewPassword,
      });
      setMessage('Password has been reset successfully.');
    } catch (err) {
      console.error('Reset error:', err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'An error occurred. Please try again.'
      );
    }
  };

  return (
    <div className="forgot-password-page">
      <form className="forgot-password-form" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        {message && <p className="form-message success">{message}</p>}
        {error && <p className="form-message error">{error}</p>}
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={reNewPassword}
          onChange={(e) => setReNewPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
