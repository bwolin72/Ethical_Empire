// src/api/services/authService.js
import axiosInstance from "../axiosInstance";
import publicAxios from "../publicAxios";
import API from "../authAPI";
import {
  saveTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  normalizeAuthResponse,
} from "../tokenManagement";

const authService = {
  // LOGIN
  login: async (credentials, remember = true) => {
    const safeCredentials = {
      email: String(credentials.email || "").trim(),
      password: String(credentials.password || ""),
      role: String(credentials.role || "").trim(),
      access_code: String(credentials.accessCode || "").trim(),
    };
    const res = await publicAxios.post(API.login, safeCredentials, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    return normalizeAuthResponse(res, remember);
  },

  // LOGOUT
  logout: async () => {
    try {
      if (API.logout) {
        await axiosInstance.post(API.logout, {}, { withCredentials: true });
      }
    } finally {
      clearTokens();
    }
  },

  // GOOGLE AUTH
  googleLogin: async (data, remember = true) => {
    const res = await publicAxios.post(API.googleLogin, data, { withCredentials: true });
    return normalizeAuthResponse(res, remember);
  },

  googleRegister: async (data, remember = true) => {
    const res = await publicAxios.post(API.googleRegister, data, { withCredentials: true });
    return normalizeAuthResponse(res, remember);
  },

  // REGISTER
  register: async (data, remember = true) => {
    const res = await publicAxios.post(API.register, data, { withCredentials: true });
    return normalizeAuthResponse(res, remember);
  },

  internalRegister: (data) => publicAxios.post(API.internalRegister, data, { withCredentials: true }),

  // PROFILE helpers (kept for backward compatibility)
  getProfile: (config = {}) => axiosInstance.get(API.profile, { ...config }),
  updateProfile: (data, config = {}) => axiosInstance.patch(API.profile, data, { ...config }),
  changePassword: (data, config = {}) => axiosInstance.post(API.changePassword, data, { ...config }),

  // ROLE helpers — keep both names so components that call currentRole() or currentUserRole() work
  currentUserRole: (config = {}) => axiosInstance.get(API.currentUserRole, { ...config }),
  currentRole: (config = {}) => axiosInstance.get(API.currentUserRole, { ...config }),

  // MISC profile endpoints
  roleChoices: (config = {}) => axiosInstance.get(API.roleChoices, { ...config }),
  partnerProfile: (config = {}) => axiosInstance.get(API.partnerProfile, { ...config }),
  vendorProfile: (config = {}) => axiosInstance.get(API.vendorProfile, { ...config }),

  // PASSWORD RESET
  resetPassword: (data) => publicAxios.post(API.resetPassword, data, { withCredentials: true }),
  resetPasswordConfirm: (uidb64, token, data) =>
    publicAxios.post(API.resetPasswordConfirm(uidb64, token), data, { withCredentials: true }),

  // TOKENS
  refreshToken: async () => {
    const refresh = getRefreshToken();
    if (!refresh) throw new Error("No refresh token found");
    const res = await publicAxios.post(API.tokenRefresh, { refresh }, { withCredentials: true });
    if (res?.data?.access) saveTokens({ access: res.data.access, refresh });
    return res;
  },

  verifyToken: (data) => publicAxios.post(API.tokenVerify, data, { withCredentials: true }),

  // OTP
  verifyOtp: (data) => publicAxios.post(API.verifyOtp, data, { withCredentials: true }),
  resendOtp: (data) => publicAxios.post(API.resendOtp, data, { withCredentials: true }),

  // ADMIN helpers
  listUsers: (params) => axiosInstance.get(API.adminListUsers, { params }),
  adminInviteWorker: (data) => axiosInstance.post(API.adminInviteWorker, data),
  adminValidateWorkerInvite: (uid, token) =>
    publicAxios.get(API.adminValidateWorkerInvite(uid, token), { withCredentials: true }),
  adminCompleteWorkerInvite: (data) =>
    publicAxios.post(API.adminCompleteWorkerInvite, data, { withCredentials: true }),
  adminResetPassword: (data) => axiosInstance.post(API.adminResetPassword, data),
  adminProfileByEmail: (data) => axiosInstance.post(API.adminProfileByEmail, data),
  adminDeleteByEmail: (data) => axiosInstance.post(API.adminDeleteByEmail, data),
  adminSendMessage: (data) => axiosInstance.post(API.adminSendMessage, data),
  adminSpecialOffer: (data) => axiosInstance.post(API.adminSpecialOffer, data),

  // WORKER
  workerCategories: (config = {}) => axiosInstance.get(API.workerCategories, { ...config }),

  // token helpers
  saveTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
};

export default authService;
