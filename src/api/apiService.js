import axiosInstance from "./axiosInstance";
import publicAxios from "./publicAxios";

/**
 * All backend API endpoints, grouped by feature.
 * Public endpoints → publicAxios
 * Auth-required endpoints → axiosInstance
 *
 * axiosInstance & publicAxios already have baseURL = https://api.eethmghmultimedia.com/api
 * so we only provide the relative path.
 */
export const API_ENDPOINTS = {
  // ------------------- Media (public) -------------------
  media: {
    all:      (params = {}) => publicAxios.get("/media/all/", { params }),
    about:    (params = {}) => publicAxios.get("/media/about/", { params }),
    banners:  (params = {}) => publicAxios.get("/media/banners/", { params }),
    home:     (params = {}) => publicAxios.get("/media/home/", { params }),
    featured: (params = {}) => publicAxios.get("/media/featured/", { params }),
    user:     (params = {}) => publicAxios.get("/media/user/", { params }),
    vendor:   (params = {}) => publicAxios.get("/media/vendor/", { params }),
    partner:  (params = {}) => publicAxios.get("/media/partner/", { params }),
    decor:    (params = {}) => publicAxios.get("/media/decor/", { params }),
    liveBand: (params = {}) => publicAxios.get("/media/live-band/", { params }),
    catering: (params = {}) => publicAxios.get("/media/catering/", { params }),
    hosting:  (params = {}) => publicAxios.get("/media/media-hosting/", { params }),
  },

  // ------------------- Videos -------------------
  videos: {
    // Core list / detail (public)
    all:    (params = {}) => publicAxios.get("/videos/videos/", { params }),
    detail: (id, params = {}) => publicAxios.get(`/videos/videos/${id}/`, { params }),

    // Toggle actions (require auth)
    toggleActive:   (id) => axiosInstance.post(`/videos/videos/${id}/toggle_active/`),
    toggleFeatured: (id) => axiosInstance.post(`/videos/videos/${id}/toggle_featured/`),

    // Endpoint-specific lists (public)
    home:             (params = {}) => publicAxios.get("/videos/videos/home/", { params }),
    about:            (params = {}) => publicAxios.get("/videos/videos/about/", { params }),
    decor:            (params = {}) => publicAxios.get("/videos/videos/decor/", { params }),
    live_band:        (params = {}) => publicAxios.get("/videos/videos/live_band/", { params }),
    catering:         (params = {}) => publicAxios.get("/videos/videos/catering/", { params }),
    media_hosting:    (params = {}) => publicAxios.get("/videos/videos/media_hosting/", { params }),
    user:             (params = {}) => publicAxios.get("/videos/videos/user/", { params }),
    vendor:           (params = {}) => publicAxios.get("/videos/videos/vendor/", { params }),
    partner:          (params = {}) => publicAxios.get("/videos/videos/partner/", { params }),
    partner_dashboard:(params = {}) => publicAxios.get("/videos/videos/partner_dashboard/", { params }),
    agency_dashboard: (params = {}) => publicAxios.get("/videos/videos/agency_dashboard/", { params }),

    // Frontend-friendly aliases (kebab-case)
    "live-band":       (params = {}) => publicAxios.get("/videos/videos/live_band/", { params }),
    "media-hosting":   (params = {}) => publicAxios.get("/videos/videos/media_hosting/", { params }),
    "partner-dashboard": (params = {}) => publicAxios.get("/videos/videos/partner_dashboard/", { params }),
    "agency-dashboard":  (params = {}) => publicAxios.get("/videos/videos/agency_dashboard/", { params }),
  },

  // ------------------- Services (public) -------------------
  services: {
    all:    (params = {}) => publicAxios.get("/services/", { params }),
    detail: (slug, params = {}) => publicAxios.get(`/services/${slug}/`, { params }),
  },

  // ------------------- Reviews (public to list, auth to moderate) -------------------
  reviews: {
    all:     (params = {}) => publicAxios.get("/reviews/", { params }),
    admin:   (params = {}) => axiosInstance.get("/reviews/admin/", { params }),
    approve: (id) => axiosInstance.post(`/reviews/${id}/approve/`),
    reply:   (id, payload) => axiosInstance.post(`/reviews/${id}/reply/`, payload),
    delete:  (id) => axiosInstance.delete(`/reviews/${id}/delete/`),
  },

  // ------------------- Promotions (public) -------------------
  promotions: {
    all:    (params = {}) => publicAxios.get("/promotions/", { params }),
    active: (params = {}) => publicAxios.get("/promotions/active/", { params }),
    detail: (id, params = {}) => publicAxios.get(`/promotions/${id}/`, { params }),
  },

  // ------------------- Contact (public) -------------------
  contact: {
    send: (payload) => publicAxios.post("/contact/send/", payload),
  },

  // ------------------- Invoices (auth) -------------------
  invoices: {
    list:   (params = {}) => axiosInstance.get("/invoices/", { params }),
    detail: (id) => axiosInstance.get(`/invoices/${id}/`),
  },

  // ------------------- Legal / Consents (auth) -------------------
  legal: {
    create:     (payload) => axiosInstance.post("/legal/consents/", payload),
    myConsents: () => axiosInstance.get("/legal/consents/me/"),
    all:        () => axiosInstance.get("/legal/consents/all/"),
    detail:     (id) => axiosInstance.get(`/legal/consents/${id}/`),
    revoke:     (id) => axiosInstance.post(`/legal/consents/${id}/revoke/`),
  },

  // ------------------- Messaging (auth) -------------------
  messaging: {
    list:       (params = {}) => axiosInstance.get("/messages/", { params }),
    create:     (payload) => axiosInstance.post("/messages/", payload),
    detail:     (id) => axiosInstance.get(`/messages/${id}/`),
    update:     (id, payload) => axiosInstance.put(`/messages/${id}/`, payload),
    delete:     (id) => axiosInstance.delete(`/messages/${id}/`),
    markRead:   (id) => axiosInstance.patch(`/messages/${id}/mark-read/`),
    markUnread: (id) => axiosInstance.patch(`/messages/${id}/mark-unread/`),
    unread:     () => axiosInstance.get("/messages/unread/"),
  },

  // ------------------- Newsletter -------------------
  // Public actions like subscribe/confirm/unsubscribe use publicAxios
  // Admin actions (list, logs, send, delete) require auth
  newsletter: {
    subscribe:          (payload) => publicAxios.post("/newsletter/subscribe/", payload),
    confirm:            (payload) => publicAxios.post("/newsletter/confirm/", payload),
    unsubscribe:        (payload) => publicAxios.post("/newsletter/unsubscribe/", payload),
    resubscribe:        (payload) => publicAxios.post("/newsletter/resubscribe/", payload),
    resendConfirmation: (payload) => publicAxios.post("/newsletter/resend-confirmation/", payload),

    list:   (params = {}) => axiosInstance.get("/newsletter/list/", { params }),
    count:  () => axiosInstance.get("/newsletter/count/"),
    logs:   (params = {}) => axiosInstance.get("/newsletter/logs/", { params }),
    send:   (payload) => axiosInstance.post("/newsletter/send/", payload),
    delete: (id)      => axiosInstance.delete(`/newsletter/delete/${id}/`),
  },

  // ------------------- Accounts & Auth (auth for most) -------------------
  accounts: {
    register:        (payload) => publicAxios.post("/accounts/register/", payload),
    verifyEmail:     (uid, token) => publicAxios.get(`/accounts/verify-email/${uid}/${token}/`),
    login:           (payload) => publicAxios.post("/accounts/login/", payload),
    logout:          () => axiosInstance.post("/accounts/profile/logout/"),
    verifyOtp:       (payload) => publicAxios.post("/accounts/verify-otp/", payload),
    resendOtp:       (payload) => publicAxios.post("/accounts/resend-otp/", payload),
    profile:         () => axiosInstance.get("/accounts/profile/"),
    changePassword:  (payload) => axiosInstance.post("/accounts/profile/change-password/", payload),
    currentRole:     () => axiosInstance.get("/accounts/profile/role/"),
    roleChoices:     () => publicAxios.get("/accounts/role-choices/"),
    workerCategories:() => publicAxios.get("/accounts/worker-categories/"),
    vendorProfile:   () => axiosInstance.get("/accounts/profile/vendor/"),
    partnerProfile:  () => axiosInstance.get("/accounts/profile/partner/"),
    resetPassword:   (payload) => publicAxios.post("/accounts/reset-password/", payload),
    resetPasswordConfirm: (uidb64, token, payload) =>
        publicAxios.post(`/accounts/reset-password-confirm/${uidb64}/${token}/`, payload),

    // JWT
    token:        (payload) => publicAxios.post("/accounts/token/", payload),
    tokenRefresh: (payload) => publicAxios.post("/accounts/token/refresh/", payload),
    tokenVerify:  (payload) => publicAxios.post("/accounts/token/verify/", payload),

    // --- Admin only ---
    admin: {
      inviteWorker:      (payload) => axiosInstance.post("/accounts/admin/invite-worker/", payload),
      validateInvite:    (uid, token) => axiosInstance.get(`/accounts/admin/worker/validate-invite/${uid}/${token}/`),
      completeInvite:    (payload) => axiosInstance.post("/accounts/admin/worker/complete-invite/", payload),
      internalRegister:  (payload) => axiosInstance.post("/accounts/admin/internal-register/", payload),
      profileByEmail:    (payload) => axiosInstance.post("/accounts/admin/profile-by-email/", payload),
      deleteByEmail:     (payload) => axiosInstance.post("/accounts/admin/delete-by-email/", payload),
      resetPassword:     (payload) => axiosInstance.post("/accounts/admin/reset-password/", payload),
      resendWelcome:     (payload) => axiosInstance.post("/accounts/admin/resend-welcome-email/", payload),
      sendMessage:       (payload) => axiosInstance.post("/accounts/admin/send-message/", payload),
      sendOffer:         (payload) => axiosInstance.post("/accounts/admin/special-offer/", payload),
      users:             (params = {}) => axiosInstance.get("/accounts/admin/users/", { params }),
    },
  },

  // ------------------- Analytics (auth) -------------------
  analytics: {
    log:   (payload) => axiosInstance.post("/analytics/log/", payload),
    stats: (params = {}) => axiosInstance.get("/analytics/stats/", { params }),
  },

  // ------------------- Bookings -------------------
  bookings: {
    public:      (params = {}) => publicAxios.get("/bookings/", { params }),
    create:      (payload) => publicAxios.post("/bookings/submit/", payload),
    user:        () => axiosInstance.get("/bookings/user/"),
    userHistory: () => axiosInstance.get("/bookings/user/history/"),
    updateDelete:(pk, payload) => axiosInstance.put(`/bookings/${pk}/`, payload),
    delete:      (pk) => axiosInstance.delete(`/bookings/${pk}/`),
    invoice:     (pk) => axiosInstance.get(`/bookings/invoice/${pk}/`),

    admin: {
      list:      (params = {}) => axiosInstance.get("/bookings/bookings-admin/bookings/", { params }),
      updateStatus: (pk, payload) => axiosInstance.post(`/bookings/bookings-admin/bookings/${pk}/status/`, payload),
      delete:    (pk) => axiosInstance.delete(`/bookings/bookings-admin/bookings/${pk}/delete/`),
      update:    (pk, payload) => axiosInstance.put(`/bookings/bookings-admin/bookings/${pk}/update/`, payload),
    },
  },
};

/**
 * Optional flat aliases for quick importing.
 */
export const FLAT_ENDPOINTS = {
  "media.user": API_ENDPOINTS.media.user,
  "media.vendor": API_ENDPOINTS.media.vendor,
  "videos.all": API_ENDPOINTS.videos.all,
  "services.all": API_ENDPOINTS.services.all,
  "reviews.all": API_ENDPOINTS.reviews.all,
  "promotions.active": API_ENDPOINTS.promotions.active,
  "newsletter.subscribe": API_ENDPOINTS.newsletter.subscribe,
  "accounts.login": API_ENDPOINTS.accounts.login,
  "bookings.user.history": API_ENDPOINTS.bookings.userHistory,
};

const apiService = { API_ENDPOINTS, FLAT_ENDPOINTS };
export default apiService;
