// src/api/api.js
import baseURL from './baseURL';

/**
 * Grouped API endpoint paths
 * Call with publicAxios (no auth) or axiosInstance (requires auth/admin)
 */
const API = {
  // ===== AUTH & ACCOUNTS =====
  auth: {
    login: `${baseURL}/api/accounts/login/`,
    logout: `${baseURL}/api/accounts/profile/logout/`,
    register: `${baseURL}/api/accounts/register/`,
    internalRegister: `${baseURL}/api/accounts/internal-register/`,

    profile: `${baseURL}/api/accounts/profile/`,
    updateProfile: `${baseURL}/api/accounts/profile/`, // use PATCH/PUT for updates
    changePassword: `${baseURL}/api/accounts/profile/change-password/`,

    resetPassword: `${baseURL}/api/accounts/reset-password/`,
    resetPasswordConfirm: (uid, token) =>
      `${baseURL}/api/accounts/reset-password-confirm/${uid}/${token}/`,

    // Google OAuth
    googleLogin: `${baseURL}/api/accounts/google-login/`,
    googleRegister: `${baseURL}/api/accounts/google-register/`,

    // JWT token endpoints
    token: `${baseURL}/api/accounts/token/`,
    tokenRefresh: `${baseURL}/api/accounts/token/refresh/`,
    tokenVerify: `${baseURL}/api/accounts/token/verify/`,

    // Additional account utilities
    profileByEmail: `${baseURL}/api/accounts/profile-by-email/`,
    partnerProfile: `${baseURL}/api/accounts/profile/partner/`,
    vendorProfile: `${baseURL}/api/accounts/profile/vendor/`,
    currentUserRole: `${baseURL}/api/accounts/profile/role/`,
    roleChoices: `${baseURL}/api/accounts/role-choices/`,
    verifyEmail: (uid, token) =>
      `${baseURL}/api/accounts/verify-email/${uid}/${token}/`,
    resendOtp: `${baseURL}/api/accounts/resend-otp/`,
    resendOtpEmail: `${baseURL}/api/accounts/resend-otp/email/`,
    verifyOtp: `${baseURL}/api/accounts/verify-otp/`,
    verifyOtpEmail: `${baseURL}/api/accounts/verify-otp/email/`,
    resendWelcomeEmail: `${baseURL}/api/accounts/resend-welcome-email/`,
    deleteByEmail: `${baseURL}/api/accounts/delete-by-email/`,

    // Admin-only account management
    adminListUsers: `${baseURL}/api/accounts/admin/list-users/`,
    adminResetPassword: `${baseURL}/api/accounts/admin-reset-password/`,
    adminInviteWorker: `${baseURL}/api/accounts/admin/invite-worker/`,

    // Invite workflow
    workerValidateInvite: (uid, token) =>
      `${baseURL}/api/accounts/worker/validate-invite/${uid}/${token}/`,
    workerCompleteInvite: `${baseURL}/api/accounts/worker/complete-invite/`,
  },

  // ===== MESSAGING =====
  messaging: {
    sendMessage: `${baseURL}/api/accounts/profiles/send-message/`,
    specialOffer: `${baseURL}/api/accounts/profiles/special-offer/`,
  },

  // ===== MEDIA =====
  media: {
    banners: `${baseURL}/api/media/banners/`,
    mediaItems: `${baseURL}/api/media/all/`,
    about: `${baseURL}/api/media/about/`,
    liveBand: `${baseURL}/api/media/live-band/`,
    catering: `${baseURL}/api/media/catering/`,
    decor: `${baseURL}/api/media/decor/`,
    mediaHosting: `${baseURL}/api/media/media-hosting/`,
    home: `${baseURL}/api/media/home/`,
    featured: `${baseURL}/api/media/featured/`,
    archived: `${baseURL}/api/media/archived/`,
    partner: `${baseURL}/api/media/partner/`,
    vendor: `${baseURL}/api/media/vendor/`,
    stats: `${baseURL}/api/media/stats/`,
    reorder: `${baseURL}/api/media/reorder/`,
    upload: `${baseURL}/api/media/upload/`,
    userMedia: `${baseURL}/api/media/user/`,
  },

  // ===== VIDEOS =====
  videos: {
    list: `${baseURL}/api/videos/videos/`,
    detail: (id) => `${baseURL}/api/videos/videos/${id}/`,
    toggleActive: (id) =>
      `${baseURL}/api/videos/videos/${id}/toggle_active/`,
    toggleFeatured: (id) =>
      `${baseURL}/api/videos/videos/${id}/toggle_featured/`,
  },

  // ===== SERVICES =====
  services: {
    list: `${baseURL}/api/services/`,
    detail: (slug) => `${baseURL}/api/services/${slug}/`,
  },

  // ===== PROMOTIONS =====
  promotions: {
    list: `${baseURL}/api/promotions/`,
    active: `${baseURL}/api/promotions/active/`,
    detail: (id) => `${baseURL}/api/promotions/${id}/`,
  },

  // ===== NEWSLETTER =====
  newsletter: {
    subscribe: `${baseURL}/api/newsletter/subscribe/`,
    unsubscribe: `${baseURL}/api/newsletter/unsubscribe/`,
    send: `${baseURL}/api/newsletter/send/`,
    logs: `${baseURL}/api/newsletter/logs/`,
    count: `${baseURL}/api/newsletter/count/`,
    confirm: `${baseURL}/api/newsletter/confirm/`,
    resendConfirmation: `${baseURL}/api/newsletter/resend-confirmation/`,
    resubscribe: `${baseURL}/api/newsletter/resubscribe/`,
    list: `${baseURL}/api/newsletter/list/`,
    delete: (id) => `${baseURL}/api/newsletter/delete/${id}/`,
  },

  // ===== REVIEWS =====
  reviews: {
    list: `${baseURL}/api/reviews/`,
    create: `${baseURL}/api/reviews/`,
    approve: (id) => `${baseURL}/api/reviews/${id}/approve/`,
    delete: (id) => `${baseURL}/api/reviews/${id}/delete/`,
    reply: (id) => `${baseURL}/api/reviews/${id}/reply/`,
    adminList: `${baseURL}/api/reviews/admin/`,
  },

  // ===== BOOKINGS =====
  bookings: {
    list: `${baseURL}/api/bookings/`,
    create: `${baseURL}/api/bookings/submit/`,
    detail: (id) => `${baseURL}/api/bookings/${id}/`,
    userBookings: `${baseURL}/api/bookings/user/`,

    adminList: `${baseURL}/api/bookings/bookings-admin/bookings/`,
    adminDetail: (id) =>
      `${baseURL}/api/bookings/bookings-admin/bookings/${id}/`,
    adminUpdate: (id) =>
      `${baseURL}/api/bookings/bookings-admin/admin/bookings/${id}/update/`,
    adminUpdateStatus: (id) =>
      `${baseURL}/api/bookings/bookings-admin/bookings/${id}/status/`,
    adminDelete: (id) =>
      `${baseURL}/api/bookings/bookings-admin/bookings/${id}/delete/`,

    invoice: (id) => `${baseURL}/api/bookings/invoice/${id}/`,
  },

  // ===== CONTACT =====
  contact: {
    send: `${baseURL}/api/contact/send/`,
  },

  // ===== ANALYTICS =====
  analytics: {
    site: `${baseURL}/api/analytics/stats/`,
    log: `${baseURL}/api/analytics/log/`,
  },

  // ===== MISC =====
  misc: {
    health: `${baseURL}/api/health/`,
    csrf: `${baseURL}/api/csrf/`,
  },
};

export default API;
