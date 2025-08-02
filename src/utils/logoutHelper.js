// src/utils/logoutHelper.js

import { toast } from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';

const AUTH_KEYS = ['access', 'refresh', 'user', 'remember'];

/**
 * Logs out the user by:
 * 1. Attempting a server-side logout using access token
 * 2. Clearing both localStorage and sessionStorage
 * 3. Redirecting to /login after 600ms
 */
export const logoutHelper = async () => {
  const access = localStorage.getItem('access') || sessionStorage.getItem('access');
  let didServerLogout = false;

  try {
    if (access) {
      // Attempt to notify backend to invalidate the session
      await axiosInstance.post('/accounts/logout/');
      toast.success('✅ You have been logged out from the server.');
      didServerLogout = true;
    } else {
      console.log('[Logout] No token found, skipping server logout.');
    }
  } catch (err) {
    console.warn('[Logout] Server logout failed:', err?.response?.status, err?.response?.data);
    if (!didServerLogout) {
      toast.error('⚠️ Server logout failed. Logging out locally.');
    }
  } finally {
    // Clear stored auth/session data
    AUTH_KEYS.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    toast.success('👋 You have been logged out.');

    // Redirect if not already on the login page
    if (!window.location.pathname.includes('/login')) {
      setTimeout(() => {
        window.location.href = '/login';
      }, 600);
    }
  }
};
