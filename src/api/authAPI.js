// src/api/authAPI.js
import baseURL from "./baseURL";
import axiosInstance from "./axiosInstance";

// -------- Endpoints (1:1 with backend routes) --------
const endpoints = {
  // Auth
  login: `${baseURL}/accounts/login/`,
  logout: `${baseURL}/accounts/logout/`,

  // Registration
  register: `${baseURL}/accounts/register/`,
  registerPartner: `${baseURL}/accounts/register/partner/`,
  registerVendor: `${baseURL}/accounts/register/vendor/`,
  internalRegister: `${baseURL}/accounts/internal-register/`,

  // Profile
  profile: `${baseURL}/accounts/profile/`,
  changePassword: `${baseURL}/accounts/profile/change-password/`,

  // Password reset
  resetPassword: `${baseURL}/accounts/reset-password/`,
  resetPasswordConfirm: (uidb64, token) =>
    `${baseURL}/accounts/reset-password-confirm/${uidb64}/${token}/`,

  // Social
  googleLogin: `${baseURL}/accounts/google-login/`,
  googleRegister: `${baseURL}/accounts/google-register/`,

  // JWT
  token: `${baseURL}/accounts/token/`,
  tokenRefresh: `${baseURL}/accounts/token/refresh/`,
  tokenVerify: `${baseURL}/accounts/token/verify/`,

  // Other account utilities
  profileByEmail: `${baseURL}/accounts/profile-by-email/`,
  partnerProfile: `${baseURL}/accounts/profile/partner/`,
  vendorProfile: `${baseURL}/accounts/profile/vendor/`,
  currentUserRole: `${baseURL}/accounts/profile/role/`,
  roleChoices: `${baseURL}/accounts/role-choices/`,
  verifyEmail: (uid, token) => `${baseURL}/accounts/verify-email/${uid}/${token}/`,

  // OTP & welcome email
  resendOtp: `${baseURL}/accounts/resend-otp/`,
  resendOtpEmail: `${baseURL}/accounts/resend-otp/email/`,
  verifyOtp: `${baseURL}/accounts/verify-otp/`,
  verifyOtpEmail: `${baseURL}/accounts/verify-otp/email/`,
  resendWelcomeEmail: `${baseURL}/accounts/resend-welcome-email/`,

  // Admin
  adminListUsers: `${baseURL}/accounts/admin/list-users/`,
  adminResetPassword: `${baseURL}/accounts/admin/reset-password/`,
  adminInviteWorker: `${baseURL}/accounts/admin/invite-worker/`,

  // Worker invitations
  workerValidateInvite: (uid, token) =>
    `${baseURL}/accounts/worker/validate-invite/${uid}/${token}/`,
  workerCompleteInvite: `${baseURL}/accounts/worker/complete-invite/`,

  // Profiles + comms
  profilesList: `${baseURL}/accounts/profiles/list/`,
  profilesProfile: `${baseURL}/accounts/profiles/profile/`,
  sendMessageToUsers: `${baseURL}/accounts/profiles/send-message/`,
  specialOffer: `${baseURL}/accounts/profiles/special-offer/`,
  toggleUserActive: (userId) =>
    `${baseURL}/accounts/profiles/toggle-active/${userId}/`,

  // Roles taxonomy
  workerCategories: `${baseURL}/accounts/worker-categories/`,

  // Internal
  deleteByEmail: `${baseURL}/accounts/delete-by-email/`,
};

// -------- API Layer --------
const authAPI = {
  endpoints,

  // Auth
  login: (data) => axiosInstance.post(endpoints.login, data),
  logout: () => axiosInstance.post(endpoints.logout),

  // Registration
  register: (data) => axiosInstance.post(endpoints.register, data),
  registerPartner: (data) => axiosInstance.post(endpoints.registerPartner, data),
  registerVendor: (data) => axiosInstance.post(endpoints.registerVendor, data),
  internalRegister: (data) => axiosInstance.post(endpoints.internalRegister, data),

  // Profile
  getProfile: () => axiosInstance.get(endpoints.profile),
  updateProfile: (data) => axiosInstance.patch(endpoints.profile, data),
  changePassword: (data) => axiosInstance.post(endpoints.changePassword, data),

  // Password reset
  resetPassword: (data) => axiosInstance.post(endpoints.resetPassword, data),
  resetPasswordConfirm: (uidb64, token, data) =>
    axiosInstance.post(endpoints.resetPasswordConfirm(uidb64, token), data),

  // JWT
  token: (data) => axiosInstance.post(endpoints.token, data),
  tokenRefresh: (data) => axiosInstance.post(endpoints.tokenRefresh, data),
  tokenVerify: (data) => axiosInstance.post(endpoints.tokenVerify, data),

  // Email/OTP
  verifyEmail: (uid, token) => axiosInstance.get(endpoints.verifyEmail(uid, token)),
  resendOtp: (data) => axiosInstance.post(endpoints.resendOtp, data),
  resendOtpEmail: (data) => axiosInstance.post(endpoints.resendOtpEmail, data),
  verifyOtp: (data) => axiosInstance.post(endpoints.verifyOtp, data),
  verifyOtpEmail: (data) => axiosInstance.post(endpoints.verifyOtpEmail, data),
  resendWelcomeEmail: (data) => axiosInstance.post(endpoints.resendWelcomeEmail, data),

  // Admin
  adminListUsers: () => axiosInstance.get(endpoints.adminListUsers),
  adminResetPassword: (data) => axiosInstance.post(endpoints.adminResetPassword, data),
  adminInviteWorker: (data) => axiosInstance.post(endpoints.adminInviteWorker, data),

  // Worker
  workerValidateInvite: (uid, token) =>
    axiosInstance.get(endpoints.workerValidateInvite(uid, token)),
  workerCompleteInvite: (data) => axiosInstance.post(endpoints.workerCompleteInvite, data),

  // Profiles
  profilesList: () => axiosInstance.get(endpoints.profilesList),
  profilesProfile: () => axiosInstance.get(endpoints.profilesProfile),
  sendMessageToUsers: (data) => axiosInstance.post(endpoints.sendMessageToUsers, data),
  specialOffer: (data) => axiosInstance.post(endpoints.specialOffer, data),
  toggleUserActive: (userId) => axiosInstance.post(endpoints.toggleUserActive(userId)),

  // Roles
  workerCategories: () => axiosInstance.get(endpoints.workerCategories),

  // Internal
  deleteByEmail: (data) => axiosInstance.post(endpoints.deleteByEmail, data),
};

export default authAPI;
