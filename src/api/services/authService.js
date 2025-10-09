// src/api/authService.js
import axiosInstance from "../axiosInstance"; // Authenticated axios (with token interceptors)
import publicAxios from "../publicAxios"; // Public axios (no token)
import API from "../authAPI"; // All backend endpoint paths
import {
  saveTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  normalizeAuthResponse,
} from "../tokenManagement";

/* ==========================================================
   AUTH SERVICE — FULLY MATCHED WITH DJANGO BACKEND
========================================================== */
const authService = {
  /* ------------------- LOGIN ------------------- */
  login: async (credentials, remember = true) => {
    const safeCredentials = {
      email: String(credentials.email || "").trim(),
      password: String(credentials.password || ""),
      role: String(credentials.role || "").trim(),
      access_code: String(credentials.accessCode || "").trim(), // backend expects snake_case
    };

    const res = await publicAxios.post(API.login, safeCredentials, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });

    return normalizeAuthResponse(res, remember);
  },

  /* ------------------- LOGOUT ------------------- */
  logout: async () => {
    try {
      if (API.logout) {
        await axiosInstance.post(API.logout, {}, { withCredentials: true });
      }
    } finally {
      clearTokens();
    }
  },

  /* ------------------- GOOGLE AUTH ------------------- */
  googleLogin: async (data, remember = true) => {
    const res = await publicAxios.post(API.googleLogin, data, { withCredentials: true });
    return normalizeAuthResponse(res, remember);
  },

  googleRegister: async (data, remember = true) => {
    const res = await publicAxios.post(API.googleRegister, data, { withCredentials: true });
    return normalizeAuthResponse(res, remember);
  },

  /* ------------------- REGISTRATION ------------------- */
  register: async (data, remember = true) => {
    const res = await publicAxios.post(API.register, data, { withCredentials: true });
    return normalizeAuthResponse(res, remember);
  },

  internalRegister: (data) =>
    publicAxios.post(API.internalRegister, data, { withCredentials: true }),

  /* ------------------- PROFILE & ROLES ------------------- */
  getProfile: () => axiosInstance.get(API.profile),
  updateProfile: (data) => axiosInstance.patch(API.profile, data),
  changePassword: (data) => axiosInstance.post(API.changePassword, data),
  currentUserRole: () => axiosInstance.get(API.currentUserRole),
  roleChoices: () => axiosInstance.get(API.roleChoices),
  partnerProfile: () => axiosInstance.get(API.partnerProfile),
  vendorProfile: () => axiosInstance.get(API.vendorProfile),

  /* ------------------- PASSWORD RESET ------------------- */
  resetPassword: (data) =>
    publicAxios.post(API.resetPassword, data, { withCredentials: true }),

  resetPasswordConfirm: (uidb64, token, data) =>
    publicAxios.post(API.resetPasswordConfirm(uidb64, token), data, {
      withCredentials: true,
    }),

  /* ------------------- JWT UTILITIES ------------------- */
  refreshToken: async () => {
    const refresh = getRefreshToken();
    if (!refresh) throw new Error("No refresh token found");

    const res = await publicAxios.post(API.tokenRefresh, { refresh }, { withCredentials: true });
    if (res?.data?.access) {
      saveTokens({ access: res.data.access, refresh });
    }
    return res;
  },

  verifyToken: (data) => publicAxios.post(API.tokenVerify, data, { withCredentials: true }),

  /* ------------------- OTP ------------------- */
  verifyOtp: (data) => publicAxios.post(API.verifyOtp, data, { withCredentials: true }),
  resendOtp: (data) => publicAxios.post(API.resendOtp, data, { withCredentials: true }),

  /* ------------------- ADMIN ------------------- */
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

  /* ------------------- WORKER ------------------- */
  workerCategories: () => axiosInstance.get(API.workerCategories),

  /* ------------------- TOKEN HELPERS ------------------- */
  saveTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
};

export default authService;
