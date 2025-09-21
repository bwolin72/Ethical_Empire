// src/api/authService.js
import publicAxios from "../publicAxios";
import axiosInstance from "../axiosInstance";
import API from "../authAPI";

// === Token Helpers ===
const TOKEN_KEY = "access";
const REFRESH_KEY = "refresh";

const saveTokens = ({ access, refresh }) => {
  if (access) localStorage.setItem(TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);

  axiosInstance.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${access}`;
};

const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  delete axiosInstance.defaults.headers.common["Authorization"];
};

const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

// Attach token if exists at load
const initToken = () => {
  const token = getAccessToken();
  if (token) {
    axiosInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${token}`;
  }
};
initToken();

const authService = {
  // ===== AUTH =====
  login: async (data) => {
    const response = await publicAxios.post(API.login, data);
    saveTokens(response.data);
    return response;
  },

  logout: async () => {
    try {
      await axiosInstance.post(API.logout);
    } finally {
      clearTokens();
    }
  },

  googleLogin: async (data) => {
    const response = await publicAxios.post(API.googleLogin, data);
    saveTokens(response.data);
    return response;
  },

  googleRegister: (data) => publicAxios.post(API.googleRegister, data),

  // ===== REGISTRATION =====
  register: (data) => publicAxios.post(API.register, data),
  internalRegister: (data) => publicAxios.post(API.internalRegister, data),

  // ===== PROFILE =====
  getProfile: () => axiosInstance.get(API.profile),
  updateProfile: (data) => axiosInstance.patch(API.profile, data),
  changePassword: (data) => axiosInstance.post(API.changePassword, data),
  currentUserRole: () => axiosInstance.get(API.currentUserRole),
  roleChoices: () => axiosInstance.get(API.roleChoices),
  partnerProfile: () => axiosInstance.get(API.partnerProfile),
  vendorProfile: () => axiosInstance.get(API.vendorProfile),

  // ===== PASSWORD RESET =====
  resetPassword: (data) => publicAxios.post(API.resetPassword, data),
  resetPasswordConfirm: (uid, token, data) =>
    publicAxios.post(API.resetPasswordConfirm(uid, token), data),
  resetPasswordConfirmUidb64: (uidb64, token, data) =>
    publicAxios.post(API.resetPasswordConfirmUidb64(uidb64, token), data),

  // ===== TOKENS (JWT) =====
  getToken: (data) => publicAxios.post(API.token, data),
  refreshToken: async () => {
    const refresh = getRefreshToken();
    if (!refresh) throw new Error("No refresh token");

    const response = await publicAxios.post(API.tokenRefresh, { refresh });
    saveTokens({ access: response.data.access, refresh });
    return response;
  },
  verifyToken: (data) => publicAxios.post(API.tokenVerify, data),

  // ===== EMAIL / OTP =====
  verifyEmail: (uidOrUidb64, token) =>
    publicAxios.get(API.verifyEmail(uidOrUidb64, token)),
  verifyOtp: (data) => publicAxios.post(API.verifyOtp, data),
  verifyOtpEmail: (data) => publicAxios.post(API.verifyOtpEmail, data),
  resendOtp: (data) => publicAxios.post(API.resendOtp, data),
  resendOtpEmail: (data) => publicAxios.post(API.resendOtpEmail, data),
  resendWelcomeEmail: (data) =>
    axiosInstance.post(API.resendWelcomeEmail, data),

  // ===== ADMIN =====
  listUsers: (params) => axiosInstance.get(API.adminListUsers, { params }),
  adminInviteWorker: (data) => axiosInstance.post(API.adminInviteWorker, data),
  adminValidateWorkerInvite: (uidOrUidb64, token) =>
    publicAxios.get(API.adminValidateWorkerInvite(uidOrUidb64, token)),
  adminCompleteWorkerInvite: (data) =>
    publicAxios.post(API.adminCompleteWorkerInvite, data),
  adminResetPassword: (data) =>
    axiosInstance.post(API.adminResetPassword, data),
  adminProfileByEmail: (data) =>
    axiosInstance.post(API.adminProfileByEmail, data),
  adminDeleteByEmail: (data) =>
    axiosInstance.post(API.adminDeleteByEmail, data),
  adminSendMessage: (data) =>
    axiosInstance.post(API.adminSendMessage, data),
  adminSpecialOffer: (data) =>
    axiosInstance.post(API.adminSpecialOffer, data),

  // ===== WORKERS =====
  workerCategories: () => axiosInstance.get(API.workerCategories),
};

export default authService;
