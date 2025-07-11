// src/utils/logoutHelper.js

import { toast } from 'react-hot-toast';

export const logoutHelper = () => {
  try {
    // Clear all stored tokens and user data
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    localStorage.removeItem('remember');

    sessionStorage.removeItem('access');
    sessionStorage.removeItem('refresh');
    sessionStorage.removeItem('user');

    sessionStorage.clear();

    // Notify user before redirect (delay redirect slightly to allow toast to show)
    toast.success('You have been logged out.');

    // Delay redirect to give toast a moment
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
    
  } catch (err) {
    console.error('Logout error:', err);
    toast.error('Failed to logout properly');
  }
};
