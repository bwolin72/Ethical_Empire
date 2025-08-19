// src/api/services/authService.js
import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import API from '../api';

const authService = {
  // ===== AUTH / REGISTER =====
  login: (data) => publicAxios.post(API.auth.endpoints.login, data),
  register: (data) => publicAxios.post(API.auth.endpoints.register, data),
  registerPartner: (data) => publicAxios.post(API.auth.endpoints.registerPartner, data),
  registerVendor: (data) => publicAxios.post(API.auth.endpoints.registerVendor, data),
  internalRegister: (data) => publicAxios.post(API.auth.endpoints.internalRegister, data),
  logout: () => axiosInstance.post(API.auth.endpoints.logout),

  // ===== PROFILE =====
  getProfile: () => axiosInstance.get(API.auth.endpoints.profile),
  updateProfile: (data) => axiosInstance.patch(API.auth.endpoints.updateProfile, data),
  changePassword: (data) => axiosInstance.post(API.auth.endpoints.changePassword, data),

  // ===== PASSWORD RESET =====
  resetPassword: (data) => publicAxios.post(API.auth.endpoints.resetPassword, data),
  resetPasswordConfirm: (uidb64, token, data) =>
    publicAxios.post(API.auth.endpoints.resetPasswordConfirm(uidb64, token), data),

  // ===== TOKENS =====
  getToken: (data) => publicAxios.post(API.auth.endpoints.token, data),
  refreshToken: (data) => publicAxios.post(API.auth.endpoints.tokenRefresh, data),
  verifyToken: (data) => publicAxios.post(API.auth.endpoints.tokenVerify, data),

  // ===== EMAIL & OTP =====
  verifyEmail: (uid, token) => publicAxios.get(API.auth.endpoints.verifyEmail(uid, token)),
  resendOtp: (data) => publicAxios.post(API.auth.endpoints.resendOtp, data),
  resendOtpEmail: (data) => publicAxios.post(API.auth.endpoints.resendOtpEmail, data),
  verifyOtp: (data) => publicAxios.post(API.auth.endpoints.verifyOtp, data),
  verifyOtpEmail: (data) => publicAxios.post(API.auth.endpoints.verifyOtpEmail, data),
  resendWelcomeEmail: (data) => publicAxios.post(API.auth.endpoints.resendWelcomeEmail, data),

  // ===== ADMIN =====
  listUsers: () => axiosInstance.get(API.auth.endpoints.adminListUsers),
  adminResetPassword: (data) => axiosInstance.post(API.auth.endpoints.adminResetPassword, data),
  inviteWorker: (data) => axiosInstance.post(API.auth.endpoints.adminInviteWorker, data),

  // ===== WORKER INVITES =====
  validateWorkerInvite: (uid, token) =>
    publicAxios.get(API.auth.endpoints.workerValidateInvite(uid, token)),
  completeWorkerInvite: (data) =>
    publicAxios.post(API.auth.endpoints.workerCompleteInvite, data),

  // ===== PROFILES (BULK OPS) =====
  profilesList: () => axiosInstance.get(API.auth.endpoints.profilesList),
  profilesProfile: () => axiosInstance.get(API.auth.endpoints.profilesProfile),
  sendMessageToUsers: (data) =>
    axiosInstance.post(API.auth.endpoints.sendMessageToUsers, data),
  specialOffer: (data) => axiosInstance.post(API.auth.endpoints.specialOffer, data),
  toggleUserActive: (userId) =>
    axiosInstance.post(API.auth.endpoints.toggleUserActive(userId)),

  // ===== WORKER CATEGORIES =====
  workerCategories: () => axiosInstance.get(API.auth.endpoints.workerCategories),

  // ===== MISC =====
  deleteByEmail: (data) => axiosInstance.post(API.auth.endpoints.deleteByEmail, data),
};

export default authService;
