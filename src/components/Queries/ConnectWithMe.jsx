import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ConnectWithMe = () => {
  const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/accounts/role/', {
        withCredentials: true,
      });
      const { is_admin } = response.data;
      if (is_admin) {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } catch (error) {
      console.error('Auth required:', error);
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
