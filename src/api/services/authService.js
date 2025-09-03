import publicAxios from "../publicAxios";
import axiosInstance from "../axiosInstance";
import API from "../authAPI";

const authService = {
  // ===== AUTH / REGISTER =====
  login: (data) => publicAxios.post(API.endpoints.login, data),
  register: (data) => publicAxios.post(API.endpoints.register, data),
  registerPartner: (data) => publicAxios.post(API.endpoints.registerPartner, data),
  registerVendor: (data) => publicAxios.post(API.endpoints.registerVendor, data),
  internalRegister: (data) => publicAxios.post(API.endpoints.internalRegister, data),
  logout: () => axiosInstance.post(API.endpoints.logout),

  // ===== SOCIAL =====
  googleLogin: (data) => publicAxios.post(API.endpoints.googleLogin, data),
  googleRegister: (data) => publicAxios.post(API.endpoints.googleRegister, data),

  // ===== PROFILE =====
  getProfile: () => axiosInstance.get(API.endpoints.profile),
  updateProfile: (data) => axiosInstance.patch(API.endpoints.profile, data),
  changePassword: (data) => axiosInstance.post(API.endpoints.changePassword, data),
  profileByEmail: (data) => axiosInstance.post(API.endpoints.profileByEmail, data),
  partnerProfile: () => axiosInstance.get(API.endpoints.partnerProfile),
  vendorProfile: () => axiosInstance.get(API.endpoints.vendorProfile),
  currentUserRole: () => axiosInstance.get(API.endpoints.currentUserRole),
  roleChoices: () => axiosInstance.get(API.endpoints.roleChoices),

  // ===== PASSWORD RESET =====
  resetPassword: (data) => publicAxios.post(API.endpoints.resetPassword, data),
  resetPasswordConfirm: (uidb64, token, data) =>
    publicAxios.post(API.endpoints.resetPasswordConfirm(uidb64, token), data),

  // ===== TOKENS =====
  getToken: (data) => publicAxios.post(API.endpoints.token, data),
  refreshToken: (data) => publicAxios.post(API.endpoints.tokenRefresh, data),
  verifyToken: (data) => publicAxios.post(API.endpoints.tokenVerify, data),

  // ===== EMAIL & OTP =====
  verifyEmail: (uid, token) => publicAxios.get(API.endpoints.verifyEmail(uid, token)),
  resendOtp: (data) => publicAxios.post(API.endpoints.resendOtp, data),
  resendOtpEmail: (data) => publicAxios.post(API.endpoints.resendOtpEmail, data),
  verifyOtp: (data) => publicAxios.post(API.endpoints.verifyOtp, data),
  verifyOtpEmail: (data) => publicAxios.post(API.endpoints.verifyOtpEmail, data),
  resendWelcomeEmail: (data) => publicAxios.post(API.endpoints.resendWelcomeEmail, data),

  // ===== ADMIN =====
  listUsers: (params) => axiosInstance.get(API.endpoints.adminListUsers, { params }),
  adminResetPassword: (data) => axiosInstance.post(API.endpoints.adminResetPassword, data),
  inviteWorker: (data) => axiosInstance.post(API.endpoints.adminInviteWorker, data),

  // ===== WORKER INVITES =====
  validateWorkerInvite: (uid, token) =>
    publicAxios.get(API.endpoints.workerValidateInvite(uid, token)),
  completeWorkerInvite: (data) => publicAxios.post(API.endpoints.workerCompleteInvite, data),

  // ===== PROFILES (BULK OPS) =====
  profilesList: (params) => axiosInstance.get(API.endpoints.profilesList, { params }),
  profilesProfile: () => axiosInstance.get(API.endpoints.profilesProfile),
  sendMessageToUsers: (data) => axiosInstance.post(API.endpoints.sendMessageToUsers, data),
  specialOffer: (data) => axiosInstance.post(API.endpoints.specialOffer, data),
  toggleUserActive: (userId) => axiosInstance.post(API.endpoints.toggleUserActive(userId)),

  // ===== WORKER CATEGORIES =====
  workerCategories: () => axiosInstance.get(API.endpoints.workerCategories),

  // ===== MISC =====
  deleteByEmail: (data) => axiosInstance.post(API.endpoints.deleteByEmail, data),
};

export default authService;
