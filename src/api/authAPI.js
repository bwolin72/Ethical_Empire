// src/api/authAPI.js
import baseURL from "./baseURL";

const API = {
  // ------------------- AUTH -------------------
  login: `${baseURL}/accounts/login/`,
  logout: `${baseURL}/accounts/profile/logout/`,
  googleLogin: `${baseURL}/accounts/google-auth/`,
  googleRegister: `${baseURL}/accounts/google-auth/`,

  // ------------------- REGISTRATION -------------------
  register: `${baseURL}/accounts/register/`,
  internalRegister: `${baseURL}/accounts/admin/internal-register/`,

  // ------------------- PROFILE -------------------
  profile: `${baseURL}/accounts/profile/`,
  profilesProfile: `${baseURL}/accounts/profiles/profile/`, // alias
  changePassword: `${baseURL}/accounts/profile/change-password/`,
  currentUserRole: `${baseURL}/accounts/profile/role/`,
  roleChoices: `${baseURL}/accounts/role-choices/`,
  vendorProfile: `${baseURL}/accounts/profile/vendor/`,
  partnerProfile: `${baseURL}/accounts/profile/partner/`,

  // ------------------- PASSWORD RESET -------------------
  resetPassword: `${baseURL}/accounts/reset-password/`,
  resetPasswordConfirm: (uidb64, token) =>
    `${baseURL}/accounts/reset-password-confirm/${uidb64}/${token}/`,

  // ------------------- JWT TOKENS -------------------
  tokenObtain: `${baseURL}/accounts/token/`,
  tokenRefresh: `${baseURL}/accounts/token/refresh/`,
  tokenVerify: `${baseURL}/accounts/token/verify/`,

  // ------------------- OTP -------------------
  verifyOtp: `${baseURL}/accounts/verify-otp/`,
  resendOtp: `${baseURL}/accounts/resend-otp/`,

  // ------------------- ADMIN -------------------
  adminListUsers: `${baseURL}/accounts/admin/users/`,
  adminInviteWorker: `${baseURL}/accounts/admin/invite-worker/`,
  adminValidateWorkerInvite: (uid, token) =>
    `${baseURL}/accounts/admin/worker/validate-invite/${uid}/${token}/`,
  adminCompleteWorkerInvite: `${baseURL}/accounts/admin/worker/complete-invite/`,
  adminResetPassword: `${baseURL}/accounts/admin/reset-password/`,
  adminProfileByEmail: `${baseURL}/accounts/admin/profile-by-email/`,
  adminDeleteByEmail: `${baseURL}/accounts/admin/delete-by-email/`,
  adminSendMessage: `${baseURL}/accounts/admin/send-message/`,
  adminSpecialOffer: `${baseURL}/accounts/admin/special-offer/`,

  // ------------------- WORKER -------------------
  workerCategories: `${baseURL}/accounts/worker-categories/`,
};

export default API;
