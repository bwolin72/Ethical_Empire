// src/api/services/profileService.js

import authAPI from "../authAPI";
import profileAPI from "../profileAPI";
import bookingAPI from "../bookingAPI"; // optional if used later

const profileService = {
  /**
   * Get the current logged-in user's profile
   */
  get: () => profileAPI.getProfile(),

  /**
   * Update the current logged-in user's profile
   * @param {Object} data - fields to update (e.g. { first_name, last_name, phone })
   */
  update: (data) => profileAPI.updateProfile(data),

  /**
   * Change password for the current logged-in user
   * @param {Object} data - { old_password, new_password }
   */
  changePassword: (data) => authAPI.changePassword(data),

  /**
   * Get the current user's role
   */
  currentRole: () => authAPI.currentRole(),
};

export default profileService;
