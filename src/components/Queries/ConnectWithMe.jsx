import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // adjust path if needed
import axiosInstance from '../../api/axiosInstance';
import './ConnectWithMe.css';

const ConnectWithMe = () => {
  const navigate = useNavigate();
  const { ready, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!ready || !isAuthenticated) {
      console.warn('[ConnectWithMe] Auth not ready or not logged in');
      return navigate('/login');
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get('/user-account/role/');
      const role = (response.data.role || '').toLowerCase().trim();

      switch (role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'vendor':
          navigate('/vendor-profile');
          break;
        case 'partner':
          navigate('/partner-profile');
          break;
        case 'user':
        default:
          navigate('/user');
      }
    } catch (error) {
      console.error('[ConnectWithMe] Failed to fetch role:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleConnect} className="connect-btn" disabled={loading}>
      {loading ? 'Connecting...' : 'Connect with Me'}
    </button>
  );
};

export default ConnectWithMe;
