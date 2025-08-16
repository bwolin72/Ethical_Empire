// src/api/authAPI.js
import baseURL from './baseURL';
import axiosInstance from './axiosInstance';

const authAPI = {
  // ===== AUTH & ACCOUNTS =====
  endpoints: {
    login: `${baseURL}/accounts/login/`,
    logout: `${baseURL}/accounts/profile/logout/`,
    register: `${baseURL}/accounts/register/`,
    internalRegister: `${baseURL}/accounts/internal-register/`,

    profile: `${baseURL}/accounts/profile/`,
    updateProfile: `${baseURL}/accounts/profile/`,
    changePassword: `${baseURL}/accounts/profile/change-password/`,

    resetPassword: `${baseURL}/accounts/reset-password/`,
    resetPasswordConfirm: (uid, token) =>
      `${baseURL}/accounts/reset-password-confirm/${uid}/${token}/`,

    googleLogin: `${baseURL}/accounts/google-login/`,
    googleRegister: `${baseURL}/accounts/google-register/`,

    token: `${baseURL}/accounts/token/`,
    tokenRefresh: `${baseURL}/accounts/token/refresh/`,
    tokenVerify: `${baseURL}/accounts/token/verify/`,

    profileByEmail: `${baseURL}/accounts/profile-by-email/`,
    partnerProfile: `${baseURL}/accounts/profile/partner/`,
    vendorProfile: `${baseURL}/accounts/profile/vendor/`,
    currentUserRole: `${baseURL}/accounts/profile/role/`,
    roleChoices: `${baseURL}/accounts/role-choices/`,
    verifyEmail: (uid, token) =>
      `${baseURL}/accounts/verify-email/${uid}/${token}/`,
    resendOtp: `${baseURL}/accounts/resend-otp/`,
    resendOtpEmail: `${baseURL}/accounts/resend-otp/email/`,
    verifyOtp: `${baseURL}/accounts/verify-otp/`,
    verifyOtpEmail: `${baseURL}/accounts/verify-otp/email/`,
    resendWelcomeEmail: `${baseURL}/accounts/resend-welcome-email/`,
    deleteByEmail: `${baseURL}/accounts/delete-by-email/`,

    adminListUsers: `${baseURL}/accounts/admin/list-users/`,
    adminResetPassword: `${baseURL}/accounts/admin-reset-password/`,
    adminInviteWorker: `${baseURL}/accounts/admin/invite-worker/`,

    workerValidateInvite: (uid, token) =>
      `${baseURL}/accounts/worker/validate-invite/${uid}/${token}/`,
    workerCompleteInvite: `${baseURL}/accounts/worker/complete-invite/`,

    profilesList: `${baseURL}/accounts/profiles/list/`,
    profilesProfile: `${baseURL}/accounts/profiles/profile/`,
    toggleUserActive: (userId) =>
      `${baseURL}/accounts/profiles/toggle-active/${userId}/`,
    workerCategories: `${baseURL}/accounts/worker-categories/`,
  },

  // ===== AUTH METHODS =====
  login: (data) => axiosInstance.post(authAPI.endpoints.login, data),
  logout: () => axiosInstance.post(authAPI.endpoints.logout),
  register: (data) => axiosInstance.post(authAPI.endpoints.register, data),
  internalRegister: (data) =>
    axiosInstance.post(authAPI.endpoints.internalRegister, data),
  getProfile: () => axiosInstance.get(authAPI.endpoints.profile),
  updateProfile: (data) => axiosInstance.patch(authAPI.endpoints.updateProfile, data),
  changePassword: (data) => axiosInstance.post(authAPI.endpoints.changePassword, data),
  resetPassword: (data) => axiosInstance.post(authAPI.endpoints.resetPassword, data),
  resetPasswordConfirm: (uid, token, data) =>
    axiosInstance.post(authAPI.endpoints.resetPasswordConfirm(uid, token), data),

  token: (data) => axiosInstance.post(authAPI.endpoints.token, data),
  tokenRefresh: (data) => axiosInstance.post(authAPI.endpoints.tokenRefresh, data),
  tokenVerify: (data) => axiosInstance.post(authAPI.endpoints.tokenVerify, data),
};

export default authAPI;
