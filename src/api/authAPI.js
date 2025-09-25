import baseURL from "./baseURL";

const API = {
  // AUTH
  login: `${baseURL}/accounts/token/`,
  logout: `${baseURL}/accounts/profile/logout/`,
  googleLogin: `${baseURL}/accounts/google-auth/`,
  googleRegister: `${baseURL}/accounts/google-auth/`,

  // REGISTRATION
  register: `${baseURL}/accounts/register/`,
  internalRegister: `${baseURL}/accounts/admin/internal-register/`,

  // PROFILE
  profile: `${baseURL}/accounts/profile/`,
  profilesProfile: `${baseURL}/accounts/profiles/profile/`,
  changePassword: `${baseURL}/accounts/profile/change-password/`,
  currentUserRole: `${baseURL}/accounts/profile/role/`,
  roleChoices: `${baseURL}/accounts/role-choices/`,
  vendorProfile: `${baseURL}/accounts/profile/vendor/`,
  partnerProfile: `${baseURL}/accounts/profile/partner/`,

  // PASSWORD RESET
  resetPassword: `${baseURL}/accounts/reset-password/`,
  resetPasswordConfirm: (uid, token) =>
    `${baseURL}/accounts/reset-password-confirm/${uid}/${token}/`,

  // JWT TOKENS
  token: `${baseURL}/accounts/token/`,
  tokenRefresh: `${baseURL}/accounts/token/refresh/`,
  tokenVerify: `${baseURL}/accounts/token/verify/`,

  // EMAIL / OTP
  verifyEmail: (uidOrUidb64, token) =>
    `${baseURL}/accounts/verify-email/${uidOrUidb64}/${token}/`,
  verifyOtp: `${baseURL}/accounts/verify-otp/`,
  verifyOtpEmail: `${baseURL}/accounts/verify-otp/email/`,
  resendOtp: `${baseURL}/accounts/resend-otp/`,
  resendOtpEmail: `${baseURL}/accounts/resend-otp/email/`,
  resendWelcomeEmail: `${baseURL}/accounts/admin/resend-welcome-email/`,

  // ADMIN
  adminListUsers: `${baseURL}/accounts/admin/users/`,
  adminInviteWorker: `${baseURL}/accounts/admin/invite-worker/`,
  adminValidateWorkerInvite: (uidOrUidb64, token) =>
    `${baseURL}/accounts/admin/worker/validate-invite/${uidOrUidb64}/${token}/`,
  adminCompleteWorkerInvite: `${baseURL}/accounts/admin/worker/complete-invite/`,
  adminResetPassword: `${baseURL}/accounts/admin/reset-password/`,
  adminProfileByEmail: `${baseURL}/accounts/admin/profile-by-email/`,
  adminDeleteByEmail: `${baseURL}/accounts/admin/delete-by-email/`,
  adminSendMessage: `${baseURL}/accounts/admin/send-message/`,
  adminSpecialOffer: `${baseURL}/accounts/admin/special-offer/`,

  // WORKERS
  workerCategories: `${baseURL}/accounts/worker-categories/`,
};

export default API;
