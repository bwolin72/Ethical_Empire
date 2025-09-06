// src/utils/authUtils.js

export const logoutHelper = (redirectUrl = '/login') => {
  try {
    // Unified: Remove all authData
    localStorage.removeItem('authData');
    sessionStorage.removeItem('authData');

    sessionStorage.clear(); // full clear (optional)

    if (process.env.NODE_ENV === 'development') {
      console.log('[LogoutHelper] User logged out and redirected to:', redirectUrl);
    }

    setTimeout(() => {
      window.location.replace(redirectUrl);
    }, 100);
    
  } catch (error) {
    console.error('[LogoutHelper] Error during logout:', error);
  }
};
