// src/utils/logoutHelper.js

import { toast } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';

export const logoutHelper = async () => {
  try {
    const access = localStorage.getItem('access') || sessionStorage.getItem('access');
    if (access) {
      // Attempt server-side logout only if token exists
      await axiosInstance.post('/accounts/logout/');
      toast.success('✅ You have been logged out from the server.');
    } else {
      console.log('[Logout] No token found, skipping server logout.');
    }
  } catch (err) {
    console.warn('[Logout] Server logout failed:', err?.response?.status, err?.response?.data);
    toast.error('⚠️ Server logout failed. Logging out locally.');
  } finally {
    // Clear both storage types
    const keys = ['access', 'refresh', 'user', 'remember'];
    keys.forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });

    sessionStorage.clear(); // Just in case

    toast.success('👋 You have been logged out.');
    setTimeout(() => {
      window.location.href = '/login';
    }, 600);
  }
};
