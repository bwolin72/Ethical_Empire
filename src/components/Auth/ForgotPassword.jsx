import React, { useState } from 'react';
import './ForgotResetPassword.css';
import axiosInstance from '../../api/axiosInstance';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await axiosInstance.post('/api/user-account/auth/reset-password/', { email });
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (err) {
      console.error('Password reset error:', err);
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
        <h2>Forgot Password</h2>
        {message && <p className="form-message success">{message}</p>}
        {error && <p className="form-message error">{error}</p>}
        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Email</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
