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
    logout: `${baseURL}/api/accounts/profile/logout/`, // note: update if different in backend
    register: `${baseURL}/api/accounts/register/`,
    profile: `${baseURL}/api/accounts/profile/`,
    updateProfile: `${baseURL}/api/accounts/profile/update/`, // check backend path for update profile
    changePassword: `${baseURL}/api/accounts/change-password/`,
    resetPassword: `${baseURL}/api/accounts/reset-password/`,
    resetPasswordConfirm: `${baseURL}/api/accounts/reset-password-confirm/`,

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
  },

  // ===== VIDEOS =====
  videos: {
    list: `${baseURL}/api/videos/`,
    detail: (id) => `${baseURL}/api/videos/${id}/`,
    toggleActive: (id) => `${baseURL}/api/videos/${id}/toggle_active/`,
    toggleFeatured: (id) => `${baseURL}/api/videos/${id}/toggle_featured/`,
  },

  // ===== SERVICES =====
  services: {
    list: `${baseURL}/api/services/`,
    detail: (id) => `${baseURL}/api/services/${id}/`,
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
    count: `${baseURL}/api/newsletter/count/`, // if backend supports subscriber count
  },

  // ===== REVIEWS =====
  reviews: {
    list: `${baseURL}/api/reviews/`,
    create: `${baseURL}/api/reviews/create/`,
  },

  // ===== BOOKINGS =====
  bookings: {
    list: `${baseURL}/api/bookings/`,
    create: `${baseURL}/api/bookings/submit/`,
    detail: (id) => `${baseURL}/api/bookings/${id}/`,

    adminList: `${baseURL}/api/bookings/bookings-admin/bookings/`,
    adminDetail: (id) => `${baseURL}/api/bookings/bookings-admin/bookings/${id}/`,
    adminUpdate: (id) => `${baseURL}/api/bookings/admin/bookings/${id}/update/`, // from admin alias path
    adminUpdateStatus: (id) => `${baseURL}/api/bookings/bookings-admin/bookings/${id}/status/`,
    adminDelete: (id) => `${baseURL}/api/bookings/bookings-admin/bookings/${id}/delete/`,
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

/**
 * Example usage:
 * 
 * // Public request
 * // import publicAxios from './publicAxios';
 * // const res = await publicAxios.get(API.promotions.active);
 * 
 * // Authenticated request
 * // import axiosInstance from './axiosInstance';
 * // const res = await axiosInstance.post(API.newsletter.send, payload);
 */
