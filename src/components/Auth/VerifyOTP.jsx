import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axiosInstance.post('/user-account/verify-otp/email/', {
        email,
        otp,
      });

      const { token, user } = data;
      localStorage.setItem('token', token);
      login({ token, user });

      const redirect = {
        ADMIN: '/admin',
        WORKER: '/worker',
        USER: '/user',
      };
      navigate(redirect[user.role] || '/user');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Invalid OTP.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-container">
      <h2>Enter OTP</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Verifying…' : 'Verify OTP'}
        </button>
      </form>
    </div>
  );
}
