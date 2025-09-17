import publicAxios from "../publicAxios";
import axiosInstance from "../axiosInstance";
import API from "../authAPI";

const authService = {
  // ===== AUTH =====
  login: (data) => publicAxios.post(API.login, data),
  logout: () => axiosInstance.post(API.logout),

  // ===== REGISTRATION =====
  register: (data) => publicAxios.post(API.register, data), // role decides path
  internalRegister: (data) => publicAxios.post(API.internalRegister, data),

  // ===== SOCIAL AUTH =====
  googleLogin: (data) => publicAxios.post(API.googleLogin, data),
  googleRegister: (data) => publicAxios.post(API.googleRegister, data),

  // ===== PROFILE =====
  getProfile: () => axiosInstance.get(API.profile),
  updateProfile: (data) => axiosInstance.patch(API.profile, data),
  changePassword: (data) => axiosInstance.post(API.changePassword, data),
  profileByEmail: (data) => axiosInstance.post(API.profileByEmail, data),
  partnerProfile: () => axiosInstance.get(API.partnerProfile),
  vendorProfile: () => axiosInstance.get(API.vendorProfile),
  currentUserRole: () => axiosInstance.get(API.currentUserRole),
  roleChoices: () => axiosInstance.get(API.roleChoices),

  // ===== PASSWORD RESET =====
  resetPassword: (data) => publicAxios.post(API.resetPassword, data),
  resetPasswordConfirm: (uidb64, token, data) =>
    publicAxios.post(API.resetPasswordConfirm(uidb64, token), data),

  // ===== TOKENS (JWT) =====
  getToken: (data) => publicAxios.post(API.token, data),
  refreshToken: (data) => publicAxios.post(API.tokenRefresh, data),
  verifyToken: (data) => publicAxios.post(API.tokenVerify, data),

  // ===== EMAIL / OTP =====
  verifyEmail: (uid, token) => publicAxios.get(API.verifyEmail(uid, token)),
  resendOtp: (data) => publicAxios.post(API.resendOtp, data),
  resendOtpEmail: (data) => publicAxios.post(API.resendOtpEmail, data),
  verifyOtp: (data) => publicAxios.post(API.verifyOtp, data),
  verifyOtpEmail: (data) => publicAxios.post(API.verifyOtpEmail, data),
  resendWelcomeEmail: (data) => publicAxios.post(API.resendWelcomeEmail, data),

  // ===== ADMIN =====
  listUsers: (params) => axiosInstance.get(API.adminListUsers, { params }),
  adminResetPassword: (data) => axiosInstance.post(API.adminResetPassword, data),
  inviteWorker: (data) => axiosInstance.post(API.adminInviteWorker, data),

  // ===== WORKERS =====
  validateWorkerInvite: (uid, token) => publicAxios.get(API.workerValidateInvite(uid, token)),
  completeWorkerInvite: (data) => publicAxios.post(API.workerCompleteInvite, data),
  workerCategories: () => axiosInstance.get(API.workerCategories),

  // ===== PROFILES / BULK =====
  profilesList: (params) => axiosInstance.get(API.profilesList, { params }),
  profilesProfile: () => axiosInstance.get(API.profilesProfile),
  sendMessageToUsers: (data) => axiosInstance.post(API.sendMessageToUsers, data),
  specialOffer: (data) => axiosInstance.post(API.specialOffer, data),
  toggleUserActive: (userId) => axiosInstance.post(API.toggleUserActive(userId)),

  // ===== INTERNAL =====
  deleteByEmail: (data) => axiosInstance.post(API.deleteByEmail, data),
};

export default authService;
