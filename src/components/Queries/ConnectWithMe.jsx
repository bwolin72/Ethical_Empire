import React from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import './ConnectWithMe.css'; // Optional CSS if needed

const ConnectWithMe = () => {
  const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      const response = await axiosInstance.get('/user-account/role/');
      const { is_admin } = response.data;

      if (is_admin) {
        navigate('/admin');
      } else {
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
