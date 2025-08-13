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
    list: `${baseURL}/services/`,                // GET all services
    detail: (slug) => `${baseURL}/services/${slug}/`, // GET single service by slug
  },

  // ===== BOOKINGS =====
  bookings: {
    // Public
    create: `${baseURL}/bookings/submit/`, // BookingCreateView
    list: `${baseURL}/bookings/`,          // PublicBookingListView

    // Authenticated User
    userBookings: `${baseURL}/bookings/user/`, // UserBookingsView
    userBookingHistory: `${baseURL}/bookings/history/`, // UserBookingHistoryView
    userBookingDetail: (id) => `${baseURL}/bookings/user/${id}/`, // Retrieve
    userBookingUpdate: (id) => `${baseURL}/bookings/user/${id}/`, // PATCH
    userBookingDelete: (id) => `${baseURL}/bookings/user/${id}/`, // DELETE

    // Admin
    adminList: `${baseURL}/bookings/admin/bookings/`, // AdminBookingsView
    adminDetail: (id) => `${baseURL}/bookings/admin/bookings/${id}/`, // Retrieve
    adminUpdate: (id) => `${baseURL}/bookings/admin/bookings/${id}/update/`, // AdminBookingUpdateView
    adminUpdateStatus: (id) => `${baseURL}/bookings/admin/bookings/${id}/status/`, // AdminBookingUpdateStatus
    adminDelete: (id) => `${baseURL}/bookings/admin/bookings/${id}/delete/`, // AdminBookingDelete

    // Invoice for a booking
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

  newsletter: {
    subscribe: `${baseURL}/newsletter/subscribe/`,
    unsubscribe: `${baseURL}/newsletter/unsubscribe/`,
    send: `${baseURL}/newsletter/send/`,
    logs: `${baseURL}/newsletter/logs/`,
    confirm: (token) => `${baseURL}/newsletter/confirm/?token=${token}`, // GET with query param
    resendConfirmation: `${baseURL}/newsletter/resend-confirmation/`,
    resubscribe: `${baseURL}/newsletter/resubscribe/`,
    list: `${baseURL}/newsletter/subscribers/`,
    delete: (id) => `${baseURL}/newsletter/subscribers/${id}/`,
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
