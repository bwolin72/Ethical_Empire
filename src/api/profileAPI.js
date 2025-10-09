// src/api/profileAPI.js
import baseURL from "./baseURL";

const profileAPI = {
  // 🔹 GET: Fetch the logged-in user's profile
  get: `${baseURL}/accounts/profile/`,

  // 🔹 PUT/PATCH: Update user & profile (name, phone, image, etc.)
  update: `${baseURL}/accounts/profile/`,

  // 🔹 POST: Change password
  changePassword: `${baseURL}/accounts/change-password/`,

  // (Optional) — GET: Current role endpoint if available on backend
  currentRole: `${baseURL}/accounts/current-role/`,
};

export default profileAPI;
