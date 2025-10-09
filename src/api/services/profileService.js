// src/api/services/profileService.js
import axiosInstance from "../axiosInstance";
import API from "../authAPI"; // single source for account endpoints

const profileService = {
  // GET: fetch authenticated user's profile
  get: (config = {}) => axiosInstance.get(API.profile, { ...config }),

  // PATCH: update profile (partial) — use patch for safety
  update: (data, config = {}) => axiosInstance.patch(API.profile, data, { ...config }),

  // POST: change password
  changePassword: (data, config = {}) =>
    axiosInstance.post(API.changePassword, data, { ...config }),

  // GET: current user's role
  currentRole: (config = {}) => axiosInstance.get(API.currentUserRole, { ...config }),
};

export default profileService;
