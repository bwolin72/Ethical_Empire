// src/pages/auth/VerifyOTP.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import './VerifyOTP.css';

export default function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      toast.error('Missing email. Redirecting...');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/user-account/verify-otp/email/', {
        email,
        otp,
      });

      const { access, refresh, user } = data;

      if (!access || !refresh || !user) {
        toast.error('Invalid response from server.');
        return;
      }

      login({ access, refresh, user });

      const redirectMap = {
        ADMIN: '/admin',
        WORKER: '/worker',
        VENDOR: '/vendor',
        PARTNER: '/partner',
        USER: '/user',
      };

      const redirectPath = redirectMap[user.role?.toUpperCase()] || '/';
      toast.success('OTP verified successfully! Redirecting...');
      setTimeout(() => navigate(redirectPath), 1500);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Invalid OTP. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) return;

    setResending(true);
    try {
      await axiosInstance.post('/user-account/resend-otp/email/', { email });
      toast.success('OTP resent successfully!');
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to resend OTP.'
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="otp-container">
      <ToastContainer autoClose={4000} />
      <h2>Verify Your Email</h2>
      <p>We've sent a 6-digit code to <strong>{email}</strong>. Enter it below to continue.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Verifying…' : 'Verify OTP'}
        </button>
      </form>

      <button
        type="button"
        className="resend-btn"
        onClick={handleResendOTP}
        disabled={resending}
      >
        {resending ? 'Resending…' : 'Resend OTP'}
      </button>
    </div>
  );
}
