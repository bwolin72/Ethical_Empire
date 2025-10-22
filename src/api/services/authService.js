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
  // ---------------- LOGIN ----------------
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

  // ---------------- LOGOUT ----------------
  logout: async () => {
    try {
      if (API.logout) {
        await axiosInstance.post(API.logout, {}, { withCredentials: true });
      }
    } finally {
      clearTokens();
    }
  },

  // ---------------- GOOGLE AUTH ----------------
  googleLogin: async (data, remember = true) => {
    const res = await publicAxios.post(API.googleLogin, data, { withCredentials: true });
    return normalizeAuthResponse(res, remember);
  },

  googleRegister: async (data, remember = true) => {
    const res = await publicAxios.post(API.googleRegister, data, { withCredentials: true });
    return normalizeAuthResponse(res, remember);
  },

  // ---------------- REGISTER ----------------
  register: async (data, remember = true) => {
    const res = await publicAxios.post(API.register, data, { withCredentials: true });
    return normalizeAuthResponse(res, remember);
  },

  internalRegister: (data) =>
    publicAxios.post(API.internalRegister, data, { withCredentials: true }),

  // ---------------- PROFILE ----------------
  getProfile: async (config = {}) => {
    const res = await axiosInstance.get(API.profile, { ...config });
    return res.data?.profile || res.data;
  },

  updateProfile: (data, config = {}) =>
    axiosInstance.patch(API.profile, data, { ...config }),

  changePassword: (data, config = {}) =>
    axiosInstance.post(API.changePassword, data, { ...config }),

  // ---------------- ROLES ----------------
  currentUserRole: (config = {}) => axiosInstance.get(API.currentUserRole, { ...config }),
  currentRole: (config = {}) => axiosInstance.get(API.currentUserRole, { ...config }),

  roleChoices: async (config = {}) => {
    const res = await axiosInstance.get(API.roleChoices, { ...config });
    return Array.isArray(res.data) ? res.data : res.data?.results || [];
  },

  workerCategories: async (config = {}) => {
    const res = await axiosInstance.get(API.workerCategories, { ...config });
    return Array.isArray(res.data) ? res.data : res.data?.results || [];
  },

  // ---------------- VENDOR / PARTNER ----------------
  partnerProfile: (config = {}) => axiosInstance.get(API.partnerProfile, { ...config }),
  vendorProfile: (config = {}) => axiosInstance.get(API.vendorProfile, { ...config }),

  // ---------------- PASSWORD RESET ----------------
  resetPassword: (data) =>
    publicAxios.post(API.resetPassword, data, { withCredentials: true }),

  resetPasswordConfirm: (uidb64, token, data) => {
    if (!data.password || !data.confirm_password) {
      throw new Error("Both password and confirm_password are required.");
    }
    return publicAxios.post(
      API.resetPasswordConfirm(uidb64, token),
      {
        password: data.password,
        confirm_password: data.confirm_password,
      },
      { withCredentials: true }
    );
  },

  // ---------------- TOKENS ----------------
  refreshToken: async () => {
    const refresh = getRefreshToken();
    if (!refresh) throw new Error("No refresh token found");
    const res = await publicAxios.post(API.tokenRefresh, { refresh }, { withCredentials: true });
    if (res?.data?.access) saveTokens({ access: res.data.access, refresh });
    return res;
  },

  verifyToken: (data) =>
    publicAxios.post(API.tokenVerify, data, { withCredentials: true }),

  // ---------------- OTP ----------------
  verifyOtp: (data) =>
    publicAxios.post(API.verifyOtp, data, { withCredentials: true }),

  resendOtp: (data) =>
    publicAxios.post(API.resendOtp, data, { withCredentials: true }),

  // ---------------- ADMIN ----------------
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

  // ---------------- TOKEN HELPERS ----------------
  saveTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
};

export default authService;
