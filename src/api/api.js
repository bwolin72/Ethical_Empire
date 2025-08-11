// src/api/api.js
import baseURL from './baseURL';

const API = {
  // ===== AUTH & ACCOUNTS =====
  auth: {
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

    // Missing in original
    profilesList: `${baseURL}/accounts/profiles/list/`,
    profilesProfile: `${baseURL}/accounts/profiles/profile/`,
    toggleUserActive: (userId) =>
      `${baseURL}/accounts/profiles/toggle-active/${userId}/`,
    workerCategories: `${baseURL}/accounts/worker-categories/`,
  },

  // ===== MESSAGING =====
  messaging: {
    sendMessage: `${baseURL}/accounts/profiles/send-message/`,
    specialOffer: `${baseURL}/accounts/profiles/special-offer/`,

    // Added direct messaging endpoints
    list: `${baseURL}/messaging/messages/`,
    detail: (id) => `${baseURL}/messaging/messages/${id}/`,
  },

  // ===== MEDIA =====
  media: {
    banners: `${baseURL}/media/banners/`,
    mediaItems: `${baseURL}/media/all/`,
    about: `${baseURL}/media/about/`,
    liveBand: `${baseURL}/media/live-band/`,
    catering: `${baseURL}/media/catering/`,
    decor: `${baseURL}/media/decor/`,
    mediaHosting: `${baseURL}/media/media-hosting/`,
    home: `${baseURL}/media/home/`,
    featured: `${baseURL}/media/featured/`,
    archived: `${baseURL}/media/archived/`,
    partner: `${baseURL}/media/partner/`,
    vendor: `${baseURL}/media/vendor/`,
    stats: `${baseURL}/media/stats/`,
    reorder: `${baseURL}/media/reorder/`,
    upload: `${baseURL}/media/upload/`,
    userMedia: `${baseURL}/media/user/`,

    // Missing media endpoints
    defaultList: `${baseURL}/media/`,
    delete: (id) => `${baseURL}/media/${id}/delete/`,
    restore: (id) => `${baseURL}/media/${id}/restore/`,
    toggle: (id) => `${baseURL}/media/${id}/toggle/`,
    toggleFeatured: (id) => `${baseURL}/media/${id}/toggle/featured/`,
    update: (id) => `${baseURL}/media/${id}/update/`,
    debugProto: `${baseURL}/media/debug/proto/`,
  },

  // ===== VIDEOS =====
  videos: {
    list: `${baseURL}/videos/videos/`,
    detail: (id) => `${baseURL}/videos/videos/${id}/`,
    toggleActive: (id) =>
      `${baseURL}/videos/videos/${id}/toggle_active/`,
    toggleFeatured: (id) =>
      `${baseURL}/videos/videos/${id}/toggle_featured/`,
  },

  // ===== SERVICES =====
  services: {
    list: `${baseURL}/services/`,
    detail: (slug) => `${baseURL}/services/${slug}/`,
    detailSlug: (slug) => `${baseURL}/services/${slug}/`, // covers <slug:slug>
  },

  // ===== PROMOTIONS =====
  promotions: {
    list: `${baseURL}/promotions/`,
    active: `${baseURL}/promotions/active/`,
    detail: (id) => `${baseURL}/promotions/${id}/`,
  },

  // ===== NEWSLETTER =====
  newsletter: {
    subscribe: `${baseURL}/newsletter/subscribe/`,
    unsubscribe: `${baseURL}/newsletter/unsubscribe/`,
    send: `${baseURL}/newsletter/send/`,
    logs: `${baseURL}/newsletter/logs/`,
    count: `${baseURL}/newsletter/count/`,
    confirm: `${baseURL}/newsletter/confirm/`,
    resendConfirmation: `${baseURL}/newsletter/resend-confirmation/`,
    resubscribe: `${baseURL}/newsletter/resubscribe/`,
    list: `${baseURL}/newsletter/list/`,
    delete: (id) => `${baseURL}/newsletter/delete/${id}/`,
  },

  // ===== REVIEWS =====
  reviews: {
    list: `${baseURL}/reviews/`,
    create: `${baseURL}/reviews/`,
    approve: (id) => `${baseURL}/reviews/${id}/approve/`,
    delete: (id) => `${baseURL}/reviews/${id}/delete/`,
    reply: (id) => `${baseURL}/reviews/${id}/reply/`,
    adminList: `${baseURL}/reviews/admin/`,
  },

  // ===== BOOKINGS =====
  bookings: {
    list: `${baseURL}/bookings/`,
    detail: (id) => `${baseURL}/bookings/${id}/`,
    create: `${baseURL}/bookings/submit/`,
    userBookings: `${baseURL}/bookings/user/`,

    adminList: `${baseURL}/bookings/bookings-admin/bookings/`,
    adminDetail: (id) =>
      `${baseURL}/bookings/bookings-admin/bookings/${id}/`,
    adminUpdate: (id) =>
      `${baseURL}/bookings/bookings-admin/admin/bookings/${id}/update/`,
    adminUpdateStatus: (id) =>
      `${baseURL}/bookings/bookings-admin/bookings/${id}/status/`,
    adminDelete: (id) =>
      `${baseURL}/bookings/bookings-admin/bookings/${id}/delete/`,

    // Added alternative admin paths
    adminSimpleList: `${baseURL}/bookings/admin/bookings/`,
    adminSimpleDelete: (id) =>
      `${baseURL}/bookings/admin/bookings/${id}/delete/`,
    adminSimpleStatus: (id) =>
      `${baseURL}/bookings/admin/bookings/${id}/status/`,

    invoice: (id) => `${baseURL}/bookings/invoice/${id}/`,
  },

  // ===== INVOICES =====
  invoices: {
    list: `${baseURL}/invoices/invoices/`,
    detail: (id) => `${baseURL}/invoices/invoices/${id}/`,
    downloadPdf: (id) =>
      `${baseURL}/invoices/invoices/${id}/download_pdf/`,
    sendEmail: (id) =>
      `${baseURL}/invoices/invoices/${id}/send_email/`,
  },

  // ===== CONTACT =====
  contact: {
    send: `${baseURL}/contact/send/`,
  },

  // ===== ANALYTICS =====
  analytics: {
    site: `${baseURL}/analytics/stats/`,
    log: `${baseURL}/analytics/log/`,
  },

  // ===== MISC =====
  misc: {
    health: `${baseURL}/health/`,
    csrf: `${baseURL}/csrf/`,
  },
};

export default API;
