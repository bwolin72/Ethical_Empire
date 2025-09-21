// src/api/authService.js
import publicAxios from "../publicAxios";
import axiosInstance from "../axiosInstance";
import API from "../authAPI";

const authService = {
  // ===== AUTH =====
  login: (data) => publicAxios.post(API.login, data),
  logout: () => axiosInstance.post(API.logout),
  googleLogin: (data) => publicAxios.post(API.googleLogin, data),
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
  refreshToken: (data) => publicAxios.post(API.tokenRefresh, data),
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
