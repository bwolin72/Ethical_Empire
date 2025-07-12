// src/utils/logoutHelper.js

import { toast } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';

export const logoutHelper = async () => {
  try {
    // Optional: Call backend logout if available
    await axiosInstance.post('/accounts/logout/'); // ✅ Make sure this endpoint exists and is open to authenticated users

    toast.success('You have been logged out from the server.');
  } catch (err) {
    console.warn('Logout API error:', err?.response?.status, err?.response?.data);
    toast.error('Server logout failed. Logging out locally.');
  } finally {
    // Always clear local/session storage
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    localStorage.removeItem('remember');

    sessionStorage.removeItem('access');
    sessionStorage.removeItem('refresh');
    sessionStorage.removeItem('user');
    sessionStorage.clear();

    // Notify and redirect
    toast.success('You have been logged out.');

    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  }
};
