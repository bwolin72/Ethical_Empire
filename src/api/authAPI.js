// src/api/authAPI.js
import baseURL from "./baseURL";
import axiosInstance from "./axiosInstance";

const endpoints = {
  // Auth
  login: `${baseURL}/api/accounts/login/`,
  logout: `${baseURL}/api/accounts/profile/logout/`,

  // Registration
  register: `${baseURL}/api/accounts/register/`,
  registerPartner: `${baseURL}/api/accounts/register/partner/`,
  registerVendor: `${baseURL}/api/accounts/register/vendor/`,
  internalRegister: `${baseURL}/api/accounts/internal-register/`,

  // Profile
  profile: `${baseURL}/api/accounts/profile/`,
  changePassword: `${baseURL}/api/accounts/profile/change-password/`,
  profileByEmail: `${baseURL}/api/accounts/profile-by-email/`,
  partnerProfile: `${baseURL}/api/accounts/profile/partner/`,
  vendorProfile: `${baseURL}/api/accounts/profile/vendor/`,
  currentUserRole: `${baseURL}/api/accounts/profile/role/`,
  roleChoices: `${baseURL}/api/accounts/role-choices/`,

  // Password reset
  resetPassword: `${baseURL}/api/accounts/reset-password/`,
  resetPasswordConfirm: (uidb64, token) =>
    `${baseURL}/api/accounts/reset-password-confirm/${uidb64}/${token}/`,

  // JWT
  token: `${baseURL}/api/accounts/token/`,
  tokenRefresh: `${baseURL}/api/accounts/token/refresh/`,
  tokenVerify: `${baseURL}/api/accounts/token/verify/`,

  // Email / OTP
  verifyEmail: (uid, token) => `${baseURL}/api/accounts/verify-email/${uid}/${token}/`,
  resendOtp: `${baseURL}/api/accounts/resend-otp/`,
  resendOtpEmail: `${baseURL}/api/accounts/resend-otp/email/`,
  verifyOtp: `${baseURL}/api/accounts/verify-otp/`,
  verifyOtpEmail: `${baseURL}/api/accounts/verify-otp/email/`,
  resendWelcomeEmail: `${baseURL}/api/accounts/resend-welcome-email/`,

  // Admin
  adminListUsers: `${baseURL}/api/accounts/admin/list-users/`,
  adminResetPassword: `${baseURL}/api/accounts/admin-reset-password/`,
  adminInviteWorker: `${baseURL}/api/accounts/admin/invite-worker/`,

  // Workers
  workerValidateInvite: (uid, token) =>
    `${baseURL}/api/accounts/worker/validate-invite/${uid}/${token}/`,
  workerCompleteInvite: `${baseURL}/api/accounts/worker/complete-invite/`,
  workerCategories: `${baseURL}/api/accounts/worker-categories/`,

  // Profiles + comms
  profilesList: `${baseURL}/api/accounts/profiles/list/`,
  profilesProfile: `${baseURL}/api/accounts/profiles/profile/`,
  sendMessageToUsers: `${baseURL}/api/accounts/profiles/send-message/`,
  specialOffer: `${baseURL}/api/accounts/profiles/special-offer/`,
  toggleUserActive: (userId) => `${baseURL}/api/accounts/profiles/toggle-active/${userId}/`,

  // Internal
  deleteByEmail: `${baseURL}/api/accounts/delete-by-email/`,
};

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
  getProfileByEmail: (data) => axiosInstance.post(endpoints.profileByEmail, data),
  getPartnerProfile: () => axiosInstance.get(endpoints.partnerProfile),
  getVendorProfile: () => axiosInstance.get(endpoints.vendorProfile),
  getCurrentUserRole: () => axiosInstance.get(endpoints.currentUserRole),
  getRoleChoices: () => axiosInstance.get(endpoints.roleChoices),

  // Password reset
  resetPassword: (data) => axiosInstance.post(endpoints.resetPassword, data),
  resetPasswordConfirm: (uidb64, token, data) =>
    axiosInstance.post(endpoints.resetPasswordConfirm(uidb64, token), data),

  // JWT
  token: (data) => axiosInstance.post(endpoints.token, data),
  tokenRefresh: (data) => axiosInstance.post(endpoints.tokenRefresh, data),
  tokenVerify: (data) => axiosInstance.post(endpoints.tokenVerify, data),

  // Email / OTP
  verifyEmail: (uid, token) => axiosInstance.get(endpoints.verifyEmail(uid, token)),
  resendOtp: (data) => axiosInstance.post(endpoints.resendOtp, data),
  resendOtpEmail: (data) => axiosInstance.post(endpoints.resendOtpEmail, data),
  verifyOtp: (data) => axiosInstance.post(endpoints.verifyOtp, data),
  verifyOtpEmail: (data) => axiosInstance.post(endpoints.verifyOtpEmail, data),
  resendWelcomeEmail: (data) => axiosInstance.post(endpoints.resendWelcomeEmail, data),

  // Admin
  adminListUsers: (params) => axiosInstance.get(endpoints.adminListUsers, { params }),
  adminResetPassword: (data) => axiosInstance.post(endpoints.adminResetPassword, data),
  adminInviteWorker: (data) => axiosInstance.post(endpoints.adminInviteWorker, data),

  // Workers
  workerValidateInvite: (uid, token) => axiosInstance.get(endpoints.workerValidateInvite(uid, token)),
  workerCompleteInvite: (data) => axiosInstance.post(endpoints.workerCompleteInvite, data),
  workerCategories: () => axiosInstance.get(endpoints.workerCategories),

  // Profiles
  profilesList: (params) => axiosInstance.get(endpoints.profilesList, { params }),
  profilesProfile: () => axiosInstance.get(endpoints.profilesProfile),
  sendMessageToUsers: (data) => axiosInstance.post(endpoints.sendMessageToUsers, data),
  specialOffer: (data) => axiosInstance.post(endpoints.specialOffer, data),
  toggleUserActive: (userId) => axiosInstance.post(endpoints.toggleUserActive(userId)),

  // Internal
  deleteByEmail: (data) => axiosInstance.post(endpoints.deleteByEmail, data),
};

export default authAPI;
