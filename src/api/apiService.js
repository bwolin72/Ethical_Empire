import axiosInstance from './axiosInstance';
import baseURL from './baseURL';

/**
 * All backend API endpoints, grouped by feature
 * and with helper methods returning axios promises.
 */
export const API_ENDPOINTS = {
  // ------------------- Media -------------------
  media: {
    all:      (params = {}) => axiosInstance.get(`${baseURL}/media/all/`, { params }),
    about:    (params = {}) => axiosInstance.get(`${baseURL}/media/about/`, { params }),
    banners:  (params = {}) => axiosInstance.get(`${baseURL}/media/banners/`, { params }),
    home:     (params = {}) => axiosInstance.get(`${baseURL}/media/home/`, { params }),
    featured: (params = {}) => axiosInstance.get(`${baseURL}/media/featured/`, { params }),
    user:     (params = {}) => axiosInstance.get(`${baseURL}/media/user/`, { params }),
    vendor:   (params = {}) => axiosInstance.get(`${baseURL}/media/vendor/`, { params }),
    partner:  (params = {}) => axiosInstance.get(`${baseURL}/media/partner/`, { params }),
    decor:    (params = {}) => axiosInstance.get(`${baseURL}/media/decor/`, { params }),
    liveBand: (params = {}) => axiosInstance.get(`${baseURL}/media/live-band/`, { params }),
    catering: (params = {}) => axiosInstance.get(`${baseURL}/media/catering/`, { params }),
    hosting:  (params = {}) => axiosInstance.get(`${baseURL}/media/media-hosting/`, { params }),
  },

  // ------------------- Videos -------------------
videos: {
  // ── Core list / detail ──────────────────────────────
  all:    (params = {}) => axiosInstance.get(`${baseURL}/videos/videos/`, { params }),
  detail: (id, params = {}) =>
          axiosInstance.get(`${baseURL}/videos/videos/${id}/`, { params }),

  // ── Toggle actions (require auth) ───────────────────
  toggleActive:   (id) =>
          axiosInstance.post(`${baseURL}/videos/videos/${id}/toggle_active/`),
  toggleFeatured: (id) =>
          axiosInstance.post(`${baseURL}/videos/videos/${id}/toggle_featured/`),

  // ── Endpoint-specific lists (public) ────────────────
  home:             (params = {}) => axiosInstance.get(`${baseURL}/videos/videos/home/`,            { params }),
  about:            (params = {}) => axiosInstance.get(`${baseURL}/videos/videos/about/`,           { params }),
  decor:            (params = {}) => axiosInstance.get(`${baseURL}/videos/videos/decor/`,           { params }),
  live_band:        (params = {}) => axiosInstance.get(`${baseURL}/videos/videos/live_band/`,       { params }),
  catering:         (params = {}) => axiosInstance.get(`${baseURL}/videos/videos/catering/`,        { params }),
  media_hosting:    (params = {}) => axiosInstance.get(`${baseURL}/videos/videos/media_hosting/`,   { params }),
  user:             (params = {}) => axiosInstance.get(`${baseURL}/videos/videos/user/`,            { params }),
  vendor:           (params = {}) => axiosInstance.get(`${baseURL}/videos/videos/vendor/`,          { params }),
  partner:          (params = {}) => axiosInstance.get(`${baseURL}/videos/videos/partner/`,         { params }),
  partner_dashboard:(params = {}) => axiosInstance.get(`${baseURL}/videos/videos/partner_dashboard/`, { params }),
  agency_dashboard: (params = {}) => axiosInstance.get(`${baseURL}/videos/videos/agency_dashboard/`,  { params }),

  // ── Frontend-friendly aliases (kebab-case) ──────────
  "live-band":     (params = {}) => axiosInstance.get(`${baseURL}/videos/videos/live_band/`,     { params }),
  "media-hosting": (params = {}) => axiosInstance.get(`${baseURL}/videos/videos/media_hosting/`, { params }),
  "partner-dashboard": (params = {}) => axiosInstance.get(`${baseURL}/videos/videos/partner_dashboard/`, { params }),
  "agency-dashboard":  (params = {}) => axiosInstance.get(`${baseURL}/videos/videos/agency_dashboard/`,  { params }),
},


  // ------------------- Services -------------------
  services: {
    all:    (params = {}) => axiosInstance.get(`${baseURL}/services/`, { params }),
    detail: (slug, params = {}) => axiosInstance.get(`${baseURL}/services/${slug}/`, { params }),
  },

  // ------------------- Reviews -------------------
  reviews: {
    all:     (params = {}) => axiosInstance.get(`${baseURL}/reviews/`, { params }),
    admin:   (params = {}) => axiosInstance.get(`${baseURL}/reviews/admin/`, { params }),
    approve: (id) => axiosInstance.post(`${baseURL}/reviews/${id}/approve/`),
    reply:   (id, payload) => axiosInstance.post(`${baseURL}/reviews/${id}/reply/`, payload),
    delete:  (id) => axiosInstance.delete(`${baseURL}/reviews/${id}/delete/`),
  },

  // ------------------- Promotions -------------------
  promotions: {
    all:    (params = {}) => axiosInstance.get(`${baseURL}/promotions/`, { params }),
    active: (params = {}) => axiosInstance.get(`${baseURL}/promotions/active/`, { params }),
    detail: (id, params = {}) => axiosInstance.get(`${baseURL}/promotions/${id}/`, { params }),
  },

  // ------------------- Contact -------------------
  contact: {
    send: (payload) => axiosInstance.post(`${baseURL}/contact/send/`, payload),
  },

  // ------------------- Invoices -------------------
  invoices: {
    list:   (params = {}) => axiosInstance.get(`${baseURL}/invoices/`, { params }),
    detail: (id) => axiosInstance.get(`${baseURL}/invoices/${id}/`),
  },

  // ------------------- Legal / Consents -------------------
  legal: {
    create:     (payload) => axiosInstance.post(`${baseURL}/legal/consents/`, payload),
    myConsents: () => axiosInstance.get(`${baseURL}/legal/consents/me/`),
    all:        () => axiosInstance.get(`${baseURL}/legal/consents/all/`),
    detail:     (id) => axiosInstance.get(`${baseURL}/legal/consents/${id}/`),
    revoke:     (id) => axiosInstance.post(`${baseURL}/legal/consents/${id}/revoke/`),
  },

  // ------------------- Messaging -------------------
  messaging: {
    list:       (params = {}) => axiosInstance.get(`${baseURL}/messages/`, { params }),
    create:     (payload) => axiosInstance.post(`${baseURL}/messages/`, payload),
    detail:     (id) => axiosInstance.get(`${baseURL}/messages/${id}/`),
    update:     (id, payload) => axiosInstance.put(`${baseURL}/messages/${id}/`, payload),
    delete:     (id) => axiosInstance.delete(`${baseURL}/messages/${id}/`),
    markRead:   (id) => axiosInstance.patch(`${baseURL}/messages/${id}/mark-read/`),
    markUnread: (id) => axiosInstance.patch(`${baseURL}/messages/${id}/mark-unread/`),
    unread:     () => axiosInstance.get(`${baseURL}/messages/unread/`),
  },

  // ------------------- Newsletter -------------------
  newsletter: {
    subscribe:           (payload) => axiosInstance.post(`${baseURL}/newsletter/subscribe/`, payload),
    confirm:             (payload) => axiosInstance.post(`${baseURL}/newsletter/confirm/`, payload),
    unsubscribe:         (payload) => axiosInstance.post(`${baseURL}/newsletter/unsubscribe/`, payload),
    resubscribe:         (payload) => axiosInstance.post(`${baseURL}/newsletter/resubscribe/`, payload),
    resendConfirmation:  (payload) => axiosInstance.post(`${baseURL}/newsletter/resend-confirmation/`, payload),
    list:                (params = {}) => axiosInstance.get(`${baseURL}/newsletter/list/`, { params }),
    count:               () => axiosInstance.get(`${baseURL}/newsletter/count/`),
    logs:                (params = {}) => axiosInstance.get(`${baseURL}/newsletter/logs/`, { params }),
    send:                (payload) => axiosInstance.post(`${baseURL}/newsletter/send/`, payload),
    delete:              (id) => axiosInstance.delete(`${baseURL}/newsletter/delete/${id}/`),
  },

  // ------------------- Accounts & Auth -------------------
  accounts: {
    register:        (payload) => axiosInstance.post(`${baseURL}/accounts/register/`, payload),
    verifyEmail:     (uid, token) => axiosInstance.get(`${baseURL}/accounts/verify-email/${uid}/${token}/`),
    login:           (payload) => axiosInstance.post(`${baseURL}/accounts/login/`, payload),
    logout:          () => axiosInstance.post(`${baseURL}/accounts/profile/logout/`),
    verifyOtp:       (payload) => axiosInstance.post(`${baseURL}/accounts/verify-otp/`, payload),
    resendOtp:       (payload) => axiosInstance.post(`${baseURL}/accounts/resend-otp/`, payload),
    profile:         () => axiosInstance.get(`${baseURL}/accounts/profile/`),
    changePassword:  (payload) => axiosInstance.post(`${baseURL}/accounts/profile/change-password/`, payload),
    currentRole:     () => axiosInstance.get(`${baseURL}/accounts/profile/role/`),
    roleChoices:     () => axiosInstance.get(`${baseURL}/accounts/role-choices/`),
    workerCategories:() => axiosInstance.get(`${baseURL}/accounts/worker-categories/`),
    vendorProfile:   () => axiosInstance.get(`${baseURL}/accounts/profile/vendor/`),
    partnerProfile:  () => axiosInstance.get(`${baseURL}/accounts/profile/partner/`),
    resetPassword:   (payload) => axiosInstance.post(`${baseURL}/accounts/reset-password/`, payload),
    resetPasswordConfirm: (uidb64, token, payload) =>
        axiosInstance.post(`${baseURL}/accounts/reset-password-confirm/${uidb64}/${token}/`, payload),

    // JWT
    token:          (payload) => axiosInstance.post(`${baseURL}/accounts/token/`, payload),
    tokenRefresh:   (payload) => axiosInstance.post(`${baseURL}/accounts/token/refresh/`, payload),
    tokenVerify:    (payload) => axiosInstance.post(`${baseURL}/accounts/token/verify/`, payload),

    // --- Admin only ---
    admin: {
      inviteWorker:      (payload) => axiosInstance.post(`${baseURL}/accounts/admin/invite-worker/`, payload),
      validateInvite:    (uid, token) => axiosInstance.get(`${baseURL}/accounts/admin/worker/validate-invite/${uid}/${token}/`),
      completeInvite:    (payload) => axiosInstance.post(`${baseURL}/accounts/admin/worker/complete-invite/`, payload),
      internalRegister:  (payload) => axiosInstance.post(`${baseURL}/accounts/admin/internal-register/`, payload),
      profileByEmail:    (payload) => axiosInstance.post(`${baseURL}/accounts/admin/profile-by-email/`, payload),
      deleteByEmail:     (payload) => axiosInstance.post(`${baseURL}/accounts/admin/delete-by-email/`, payload),
      resetPassword:     (payload) => axiosInstance.post(`${baseURL}/accounts/admin/reset-password/`, payload),
      resendWelcome:     (payload) => axiosInstance.post(`${baseURL}/accounts/admin/resend-welcome-email/`, payload),
      sendMessage:       (payload) => axiosInstance.post(`${baseURL}/accounts/admin/send-message/`, payload),
      sendOffer:         (payload) => axiosInstance.post(`${baseURL}/accounts/admin/special-offer/`, payload),
      users:             (params = {}) => axiosInstance.get(`${baseURL}/accounts/admin/users/`, { params }),
    },
  },

  // ------------------- Analytics -------------------
  analytics: {
    log:   (payload) => axiosInstance.post(`${baseURL}/analytics/log/`, payload),
    stats: (params = {}) => axiosInstance.get(`${baseURL}/analytics/stats/`, { params }),
  },

  // ------------------- Bookings -------------------
  bookings: {
    public:      (params = {}) => axiosInstance.get(`${baseURL}/bookings/`, { params }),
    create:      (payload) => axiosInstance.post(`${baseURL}/bookings/submit/`, payload),
    user:        () => axiosInstance.get(`${baseURL}/bookings/user/`),
    userHistory: () => axiosInstance.get(`${baseURL}/bookings/user/history/`),
    updateDelete:(pk, payload) => axiosInstance.put(`${baseURL}/bookings/${pk}/`, payload),
    delete:      (pk) => axiosInstance.delete(`${baseURL}/bookings/${pk}/`),
    invoice:     (pk) => axiosInstance.get(`${baseURL}/bookings/invoice/${pk}/`),

    admin: {
      list:      (params = {}) => axiosInstance.get(`${baseURL}/bookings/bookings-admin/bookings/`, { params }),
      updateStatus: (pk, payload) => axiosInstance.post(`${baseURL}/bookings/bookings-admin/bookings/${pk}/status/`, payload),
      delete:    (pk) => axiosInstance.delete(`${baseURL}/bookings/bookings-admin/bookings/${pk}/delete/`),
      update:    (pk, payload) => axiosInstance.put(`${baseURL}/bookings/bookings-admin/bookings/${pk}/update/`, payload),
    },
  },
};

/**
 * Optional flat aliases for quick importing.
 * Keys are dotted paths like "bookings.user.history".
 */
export const FLAT_ENDPOINTS = {
  'media.user': API_ENDPOINTS.media.user,
  'media.vendor': API_ENDPOINTS.media.vendor,
  'videos.all': API_ENDPOINTS.videos.all,
  'services.all': API_ENDPOINTS.services.all,
  'reviews.all': API_ENDPOINTS.reviews.all,
  'promotions.active': API_ENDPOINTS.promotions.active,
  'newsletter.subscribe': API_ENDPOINTS.newsletter.subscribe,
  'accounts.login': API_ENDPOINTS.accounts.login,
  'bookings.user.history': API_ENDPOINTS.bookings.userHistory,
  // …add any other frequently used single calls here
};

const apiService = { API_ENDPOINTS, FLAT_ENDPOINTS };
export default apiService;
