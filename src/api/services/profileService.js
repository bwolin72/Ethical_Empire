// src/api/services/profileService.js
import profileAPI from "../profileAPI";

const profileService = {
  /**
   * Get the current logged-in user's profile
   */
  get: async () => {
    const response = await profileAPI.getProfile();
    return response;
  },

  /**
   * Update the current logged-in user's profile
   * @param {Object} data - fields to update (e.g. { first_name, last_name, phone })
   */
  update: async (data) => {
    const response = await profileAPI.updateProfile(data);
    return response;
  },

  /**
   * Change password for the current logged-in user
   * @param {Object} data - { current_password, new_password }
   */
  changePassword: async (data) => {
    const response = await profileAPI.changePassword(data);
    return response;
  },

  /**
   * Get the current user's role
   */
  currentRole: async () => {
    const response = await profileAPI.currentRole();
    return response;
  },
};

export default profileService;
