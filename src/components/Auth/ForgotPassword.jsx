import React, { useState } from 'react';
import './ForgotResetPassword.css';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/users/reset_password/', { email });
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="forgot-password-page">
      <form className="forgot-password-form" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        {message && <p className="form-message">{message}</p>}
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
