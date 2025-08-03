import React from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import './ConnectWithMe.css'; // Optional CSS if needed

const ConnectWithMe = () => {
  const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      const response = await axiosInstance.get('/user-account/role/');
      const { role } = response.data;

      // Redirect based on user role
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
      console.error('Authentication required or failed:', error);
      navigate('/login');
    }
  };

  return (
    <button onClick={handleConnect} className="connect-btn">
      Connect with Me
    </button>
  );
};

export default ConnectWithMe;
