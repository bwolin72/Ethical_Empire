import baseURL from "./baseURL";

const endpoints = {
  // ===== AUTH =====
  login: `${baseURL}/accounts/login/`,
  logout: `${baseURL}/accounts/profile/logout/`,

  // ===== REGISTRATION =====
  register: `${baseURL}/accounts/register/`, // Handles user, partner, vendor, worker, internal
  internalRegister: `${baseURL}/accounts/internal-register/`, // Optional legacy

  // ===== SOCIAL AUTH =====
  googleLogin: `${baseURL}/accounts/google-login/`,
  googleRegister: `${baseURL}/accounts/google-register/`,

  // ===== PROFILE =====
  profile: `${baseURL}/accounts/profile/`,
  changePassword: `${baseURL}/accounts/profile/change-password/`,
  profileByEmail: `${baseURL}/accounts/profile-by-email/`,
  partnerProfile: `${baseURL}/accounts/profile/partner/`,
  vendorProfile: `${baseURL}/accounts/profile/vendor/`,
  currentUserRole: `${baseURL}/accounts/profile/role/`,
  roleChoices: `${baseURL}/accounts/role-choices/`,

  // ===== PASSWORD RESET =====
  resetPassword: `${baseURL}/accounts/reset-password/`,
  resetPasswordConfirm: (uidb64, token) =>
    `${baseURL}/accounts/reset-password-confirm/${uidb64}/${token}/`,

  // ===== TOKENS (JWT) =====
  token: `${baseURL}/accounts/token/`,
  tokenRefresh: `${baseURL}/accounts/token/refresh/`,
  tokenVerify: `${baseURL}/accounts/token/verify/`,

  // ===== EMAIL / OTP =====
  verifyEmail: (uid, token) => `${baseURL}/accounts/verify-email/${uid}/${token}/`,
  resendOtp: `${baseURL}/accounts/resend-otp/`,
  resendOtpEmail: `${baseURL}/accounts/resend-otp/email/`,
  verifyOtp: `${baseURL}/accounts/verify-otp/`,
  verifyOtpEmail: `${baseURL}/accounts/verify-otp/email/`,
  resendWelcomeEmail: `${baseURL}/accounts/resend-welcome-email/`,

  // ===== ADMIN =====
  adminListUsers: `${baseURL}/accounts/admin/list-users/`,
  adminResetPassword: `${baseURL}/accounts/admin-reset-password/`,
  adminInviteWorker: `${baseURL}/accounts/admin/invite-worker/`,

  // ===== WORKERS =====
  workerValidateInvite: (uid, token) =>
    `${baseURL}/accounts/worker/validate-invite/${uid}/${token}/`,
  workerCompleteInvite: `${baseURL}/accounts/worker/complete-invite/`,
  workerCategories: `${baseURL}/accounts/worker-categories/`,

  // ===== PROFILES / BULK =====
  profilesList: `${baseURL}/accounts/profiles/list/`,
  profilesProfile: `${baseURL}/accounts/profiles/profile/`,
  sendMessageToUsers: `${baseURL}/accounts/profiles/send-message/`,
  specialOffer: `${baseURL}/accounts/profiles/special-offer/`,
  toggleUserActive: (userId) =>
    `${baseURL}/accounts/profiles/toggle-active/${userId}/`,

  // ===== INTERNAL =====
  deleteByEmail: `${baseURL}/accounts/delete-by-email/`,
};

export default endpoints;
