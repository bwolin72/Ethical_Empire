
import { API_ENDPOINTS } from "../apiService";

export const ProfileService = {
  /**
   * Get the current logged-in user's profile
   */
  get: () => API_ENDPOINTS.accounts.profile(),

  /**
   * Update the current logged-in user's profile
   * @param {Object} data - fields to update (e.g. { first_name, last_name, phone })
   */
  update: (data) => API_ENDPOINTS.accounts.updateProfile(data),

  /**
   * Change password for the current logged-in user
   * @param {Object} data - { old_password, new_password }
   */
  changePassword: (data) => API_ENDPOINTS.accounts.changePassword(data),

  /**
   * Get the current user's role
   */
  currentRole: () => API_ENDPOINTS.accounts.currentRole(),
};
