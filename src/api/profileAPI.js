// src/api/profileAPI.js
import axiosInstance from "./axiosInstance";

const profileAPI = {
  /**
   * GET - Fetch the logged-in user's profile
   */
  getProfile: () => axiosInstance.get("/accounts/profile/"),

  /**
   * PUT/PATCH - Update the logged-in user's profile
   * @param {Object} data - e.g. { first_name, last_name, phone, profile_image_url }
   */
  updateProfile: (data) => axiosInstance.patch("/accounts/profile/", data),

  /**
   * POST - Change the user's password
   * @param {Object} data - { current_password, new_password }
   */
  changePassword: (data) =>
    axiosInstance.post("/accounts/profile/change-password/", data),

  /**
   * GET - Fetch current user's role
   */
  currentRole: () => axiosInstance.get("/accounts/profile/role/"),
};

export default profileAPI;
