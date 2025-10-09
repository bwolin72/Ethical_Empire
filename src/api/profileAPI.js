// src/api/profileAPI.js
import baseURL from "./baseURL";

const profileAPI = {
  // ✅ GET: Fetch the logged-in user's profile
  get: `${baseURL}/accounts/profile/`,

  // ✅ PUT/PATCH: Update user & profile (name, phone, image, etc.)
  update: `${baseURL}/accounts/profile/`,

  // ✅ POST: Change password
  changePassword: `${baseURL}/accounts/change-password/`,

  // ✅ GET: Get the current logged-in user's role
  currentRole: `${baseURL}/accounts/current-role/`,
};

// ✅ Use default export (not named)
export default profileAPI;
