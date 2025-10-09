// src/api/profileAPI.js
import baseURL from "./baseURL";

const profileAPI = {
  // Authenticated profile endpoints
  profile: `${baseURL}/accounts/profile/`,
  updateProfile: `${baseURL}/accounts/profile/`,
  changePassword: `${baseURL}/accounts/profile/change-password/`,
  currentRole: `${baseURL}/accounts/profile/role/`,
};

export default profileAPI;
