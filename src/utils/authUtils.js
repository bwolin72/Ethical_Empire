// src/utils/authUtils.js

/**
 * Utility function to handle logout actions consistently across the app.
 * This includes clearing tokens, user data, cache, and redirecting.
 */
export const logoutHelper = (redirectUrl = '/login') => {
  try {
    // Clear auth tokens
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');

    // Optional: Clear additional localStorage/sessionStorage keys
    localStorage.removeItem('user_info'); // Example
    sessionStorage.clear();

    // Optional: Invalidate any cached data (e.g., for SWR or React Query)
    // queryClient.clear(); // if using React Query

    // Optional: Log the logout event
    if (process.env.NODE_ENV === 'development') {
      console.log('[LogoutHelper] User logged out and redirected to:', redirectUrl);
    }

    // Delay redirect slightly to ensure state is fully cleared
    setTimeout(() => {
      // Use history.replaceState to avoid adding extra history entry
      window.location.replace(redirectUrl);
    }, 100); // Small delay for state clearing (optional)

  } catch (error) {
    console.error('[LogoutHelper] Error during logout:', error);
  }
};
