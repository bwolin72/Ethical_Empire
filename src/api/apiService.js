import axiosInstance from "./axiosInstance";
import publicAxios from "./publicAxios";

/**
 * Utility to convert snake_case or camelCase keys into kebab-case.
 */
const toKebab = (str) =>
  str.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/_/g, "-").toLowerCase();

/**
 * Normalize request config → separates params & signal properly.
 */
const normalizeConfig = (config = {}) => {
  const { params = {}, signal, ...rest } = config;
  return { params, signal, ...rest };
};

/**
 * Helper wrappers to avoid duplicating { params } logic.
 */
const withPublicGet = (url) => (config = {}) =>
  publicAxios.get(url, normalizeConfig(config));

const withAuthGet = (url) => (config = {}) =>
  axiosInstance.get(url, normalizeConfig(config));

const withPublicPost = (url) => (payload, config = {}) =>
  publicAxios.post(url, payload, normalizeConfig(config));

const withAuthPost = (url) => (payload, config = {}) =>
  axiosInstance.post(url, payload, normalizeConfig(config));

/**
 * Recursively adds kebab-case aliases to API_ENDPOINTS objects.
 */
const addKebabAliases = (obj) => {
  if (typeof obj !== "object" || obj === null) return obj;

  const newObj = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "function") {
      newObj[key] = value;
      const kebab = toKebab(key);
      if (kebab !== key) newObj[kebab] = value;
    } else {
      newObj[key] = addKebabAliases(value);
      const kebab = toKebab(key);
      if (kebab !== key) newObj[kebab] = newObj[key];
    }
  }
  return newObj;
};

/**
 * All backend API endpoints.
 */
const RAW_ENDPOINTS = {
  // ------------------- Media (public) -------------------
  media: {
    all: withPublicGet("/media/all/"),
    about: withPublicGet("/media/about/"),
    banners: withPublicGet("/media/banners/"),
    home: withPublicGet("/media/home/"),
    featured: withPublicGet("/media/featured/"),
    user: withPublicGet("/media/user/"),
    vendor: withPublicGet("/media/vendor/"),
    partner: withPublicGet("/media/partner/"),
    decor: withPublicGet("/media/decor/"),
    liveBand: withPublicGet("/media/live-band/"),
    catering: withPublicGet("/media/catering/"),
    mediaHosting: withPublicGet("/media/media-hosting/"),
  },

  // ------------------- Videos -------------------
  videos: {
    all: withPublicGet("/videos/videos/"),
    detail: (id, config = {}) =>
      publicAxios.get(`/videos/videos/${id}/`, normalizeConfig(config)),

    toggleActive: (id) => axiosInstance.post(`/videos/videos/${id}/toggle_active/`),
    toggleFeatured: (id) => axiosInstance.post(`/videos/videos/${id}/toggle_featured/`),

    home: withPublicGet("/videos/videos/home/"),
    about: withPublicGet("/videos/videos/about/"),
    decor: withPublicGet("/videos/videos/decor/"),
    live_band: withPublicGet("/videos/videos/live_band/"),
    catering: withPublicGet("/videos/videos/catering/"),
    media_hosting: withPublicGet("/videos/videos/media_hosting/"),
    user: withPublicGet("/videos/videos/user/"),
    vendor: withPublicGet("/videos/videos/vendor/"),
    partner: withPublicGet("/videos/videos/partner/"),
    partner_dashboard: withPublicGet("/videos/videos/partner_dashboard/"),
    agency_dashboard: withPublicGet("/videos/videos/agency_dashboard/"),
  },

  // ------------------- Services -------------------
  services: {
    all: withPublicGet("/services/"),
    detail: (slug, config = {}) =>
      publicAxios.get(`/services/${slug}/`, normalizeConfig(config)),
  },

  // ------------------- Reviews -------------------
  reviews: {
    all: withPublicGet("/reviews/"),
    admin: withAuthGet("/reviews/admin/"),
    approve: (id) => axiosInstance.post(`/reviews/${id}/approve/`),
    reply: (id, payload) => axiosInstance.post(`/reviews/${id}/reply/`, payload),
    delete: (id) => axiosInstance.delete(`/reviews/${id}/delete/`),
  },

  // ------------------- Promotions -------------------
  promotions: {
    all: withPublicGet("/promotions/"),
    active: withPublicGet("/promotions/active/"),
    detail: (id, config = {}) =>
      publicAxios.get(`/promotions/${id}/`, normalizeConfig(config)),
  },

  // ------------------- Contact -------------------
  contact: {
    send: withPublicPost("/contact/send/"),
  },

  // ------------------- Invoices -------------------
  invoices: {
    list: withAuthGet("/invoices/"),
    detail: (id) => axiosInstance.get(`/invoices/${id}/`),
  },

  // ------------------- Legal -------------------
  legal: {
    create: withAuthPost("/legal/consents/"),
    myConsents: () => axiosInstance.get("/legal/consents/me/"),
    all: () => axiosInstance.get("/legal/consents/all/"),
    detail: (id) => axiosInstance.get(`/legal/consents/${id}/`),
    revoke: (id) => axiosInstance.post(`/legal/consents/${id}/revoke/`),
  },

  // ------------------- Messaging -------------------
  messaging: {
    list: withAuthGet("/messages/"),
    create: withAuthPost("/messages/"),
    detail: (id) => axiosInstance.get(`/messages/${id}/`),
    update: (id, payload) => axiosInstance.put(`/messages/${id}/`, payload),
    delete: (id) => axiosInstance.delete(`/messages/${id}/`),
    markRead: (id) => axiosInstance.patch(`/messages/${id}/mark-read/`),
    markUnread: (id) => axiosInstance.patch(`/messages/${id}/mark-unread/`),
    unread: () => axiosInstance.get("/messages/unread/"),
  },

  // ------------------- Newsletter -------------------
  newsletter: {
    subscribe: withPublicPost("/newsletter/subscribe/"),
    confirm: withPublicPost("/newsletter/confirm/"),
    unsubscribe: withPublicPost("/newsletter/unsubscribe/"),
    resubscribe: withPublicPost("/newsletter/resubscribe/"),
    resendConfirmation: withPublicPost("/newsletter/resend-confirmation/"),

    list: withAuthGet("/newsletter/list/"),
    count: () => axiosInstance.get("/newsletter/count/"),
    logs: withAuthGet("/newsletter/logs/"),
    send: withAuthPost("/newsletter/send/"),
    delete: (id) => axiosInstance.delete(`/newsletter/delete/${id}/`),
  },

  // ------------------- Accounts -------------------
  accounts: {
    register: withPublicPost("/accounts/register/"),
    verifyEmail: (uid, token) =>
      publicAxios.get(`/accounts/verify-email/${uid}/${token}/`),
    login: withPublicPost("/accounts/login/"),
    logout: () => axiosInstance.post("/accounts/profile/logout/"),
    verifyOtp: withPublicPost("/accounts/verify-otp/"),
    resendOtp: withPublicPost("/accounts/resend-otp/"),
    profile: withAuthGet("/accounts/profile/"),
    changePassword: withAuthPost("/accounts/profile/change-password/"),
    currentRole: withAuthGet("/accounts/profile/role/"),
    roleChoices: withPublicGet("/accounts/role-choices/"),
    workerCategories: withPublicGet("/accounts/worker-categories/"),
    vendorProfile: withAuthGet("/accounts/profile/vendor/"),
    partnerProfile: withAuthGet("/accounts/profile/partner/"),
    resetPassword: withPublicPost("/accounts/reset-password/"),
    resetPasswordConfirm: (uidb64, token, payload) =>
      publicAxios.post(`/accounts/reset-password-confirm/${uidb64}/${token}/`, payload),

    token: withPublicPost("/accounts/token/"),
    tokenRefresh: withPublicPost("/accounts/token/refresh/"),
    tokenVerify: withPublicPost("/accounts/token/verify/"),

    admin: {
      inviteWorker: withAuthPost("/accounts/admin/invite-worker/"),
      validateInvite: (uid, token) =>
        axiosInstance.get(`/accounts/admin/worker/validate-invite/${uid}/${token}/`),
      completeInvite: withAuthPost("/accounts/admin/worker/complete-invite/"),
      internalRegister: withAuthPost("/accounts/admin/internal-register/"),
      profileByEmail: withAuthPost("/accounts/admin/profile-by-email/"),
      deleteByEmail: withAuthPost("/accounts/admin/delete-by-email/"),
      resetPassword: withAuthPost("/accounts/admin/reset-password/"),
      resendWelcome: withAuthPost("/accounts/admin/resend-welcome-email/"),
      sendMessage: withAuthPost("/accounts/admin/send-message/"),
      sendOffer: withAuthPost("/accounts/admin/special-offer/"),
      users: withAuthGet("/accounts/admin/users/"),
    },
  },

  // ------------------- Analytics -------------------
  analytics: {
    log: withAuthPost("/analytics/log/"),
    stats: withAuthGet("/analytics/stats/"),
  },

  // ------------------- Bookings -------------------
  bookings: {
    public: withPublicGet("/bookings/"),
    create: withPublicPost("/bookings/submit/"),
    user: withAuthGet("/bookings/user/"),
    userHistory: withAuthGet("/bookings/user/history/"),
    updateDelete: (pk, payload) => axiosInstance.put(`/bookings/${pk}/`, payload),
    delete: (pk) => axiosInstance.delete(`/bookings/${pk}/`),
    invoice: (pk) => axiosInstance.get(`/bookings/invoice/${pk}/`),

    admin: {
      list: withAuthGet("/bookings/bookings-admin/bookings/"),
      updateStatus: (pk, payload) =>
        axiosInstance.post(`/bookings/bookings-admin/bookings/${pk}/status/`, payload),
      delete: (pk) =>
        axiosInstance.delete(`/bookings/bookings-admin/bookings/${pk}/delete/`),
      update: (pk, payload) =>
        axiosInstance.put(`/bookings/bookings-admin/bookings/${pk}/update/`, payload),
    },
  },
};

// Add kebab-case aliases automatically
export const API_ENDPOINTS = addKebabAliases(RAW_ENDPOINTS);

// Optional flat aliases
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
