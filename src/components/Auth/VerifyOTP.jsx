// src/pages/auth/VerifyOTP.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import axiosInstance from '../../api/axiosInstance';
import API from '../../api/api';
import { useAuth } from '../context/AuthContext';
import './VerifyOTP.css';

export default function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get('email') || '';
  const phone = searchParams.get('phone') || '';

  useEffect(() => {
    if (!email && !phone) {
      toast.error('Missing email or phone. Redirecting...');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [email, phone, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedOtp = otp.trim();

    if (trimmedOtp.length !== 6 || !/^\d{6}$/.test(trimmedOtp)) {
      toast.error('OTP must be exactly 6 digits.');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(API.auth.verifyOtp, {
        otp: trimmedOtp,
        email: email || undefined,
        phone: phone || undefined,
      });

      const { tokens, user } = response.data;
      if (!tokens?.access || !tokens?.refresh || !user) {
        toast.error('Invalid server response.');
        return;
      }

      login({ access: tokens.access, refresh: tokens.refresh, user });

      const redirectMap = {
        ADMIN: '/admin',
        WORKER: '/worker',
        VENDOR: '/vendor',
        PARTNER: '/partner',
        USER: '/user',
      };

      const role = user?.role?.toUpperCase() || 'USER';
      const redirectPath = redirectMap[role] || '/';

      toast.success('✅ OTP verified! Redirecting...');
      setTimeout(() => navigate(redirectPath), 1500);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Invalid or expired OTP.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email && !phone) {
      toast.error('Cannot resend OTP without email or phone.');
      return;
    }

    setResending(true);
    try {
      await axiosInstance.post(API.auth.resendOtp, {
        email: email || undefined,
        phone: phone || undefined,
      });
      toast.success(`OTP resent to ${email || ''}${email && phone ? ' and ' : ''}${phone || ''}`);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to resend OTP.';
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="otp-container">
      <ToastContainer autoClose={4000} />
      <h2>Verify Your Account</h2>
      <p>
        A 6-digit code has been sent to
        {email && <strong> {email}</strong>}
        {email && phone && ' and'}
        {phone && <strong> {phone}</strong>}.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          autoFocus
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-digit OTP"
          required
        />

        <button type="submit" disabled={loading || otp.trim().length !== 6}>
          {loading ? 'Verifying…' : 'Verify OTP'}
        </button>
      </form>

      <div className="resend-wrapper">
        <button
          type="button"
          className="resend-btn"
          onClick={handleResendOTP}
          disabled={resending}
        >
          {resending ? 'Resending…' : 'Resend OTP'}
        </button>
      </div>

      <p className="support-note">
        Didn’t receive the code? Check your spam or junk folder.
      </p>
    </div>
  );
}
