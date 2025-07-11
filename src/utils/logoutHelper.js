// src/utils/logoutHelper.js

import { toast } from 'react-hot-toast';

export const logoutHelper = () => {
  try {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');

    sessionStorage.clear();

    // Optional: Redirect manually if not using context
    window.location.href = '/login';

    // Optional: Notify user
    toast.success('You have been logged out.');
  } catch (err) {
    console.error('Logout error:', err);
    toast.error('Failed to logout properly');
  }
};
