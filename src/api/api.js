// src/api/api.js
import baseURL from './baseURL';
import publicAxios from './publicAxios';
import axiosInstance from './axiosInstance';

/**
 * Grouped API endpoint paths
 * Call with publicAxios (no auth) or axiosInstance (requires auth/admin)
 */
const API = {
  // ===== AUTH & ACCOUNTS =====
  auth: {
    login: `${baseURL}/api/accounts/login/`,
    logout: `${baseURL}/api/accounts/logout/`,
    register: `${baseURL}/api/accounts/register/`,
    profile: `${baseURL}/api/accounts/profile/`,
    updateProfile: `${baseURL}/api/accounts/profile/update/`,
    changePassword: `${baseURL}/api/accounts/change-password/`,
    resetPassword: `${baseURL}/api/accounts/reset-password/`,
    resetPasswordConfirm: `${baseURL}/api/accounts/reset-password-confirm/`,

    // Admin-only account management
    adminListUsers: `${baseURL}/api/accounts/admin/list-users/`,
    adminResetPassword: `${baseURL}/api/accounts/admin-reset-password/`,
    adminInviteWorker: `${baseURL}/api/accounts/admin/invite-worker/`,

    // Invite workflow
    workerValidateInvite: (uid, token) => `${baseURL}/api/accounts/worker/validate-invite/${uid}/${token}/`,
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
    mediaItems: `${baseURL}/api/media/media/`,
    about: `${baseURL}/api/media/about/`,
    liveBand: `${baseURL}/api/media/live-band/`,
    catering: `${baseURL}/api/media/catering/`,
    decor: `${baseURL}/api/media/decor/`,
    mediaHosting: `${baseURL}/api/media/media-hosting/`,
  },

  // ===== VIDEOS =====
  videos: {
    list: `${baseURL}/api/videos/videos/`,
    detail: (id) => `${baseURL}/api/videos/videos/${id}/`,
    toggleActive: (id) => `${baseURL}/api/videos/videos/${id}/toggle_active/`,
    toggleFeatured: (id) => `${baseURL}/api/videos/videos/${id}/toggle_featured/`,
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
  },

  // ===== REVIEWS =====
  reviews: {
    list: `${baseURL}/api/reviews/`,
    create: `${baseURL}/api/reviews/create/`,
  },

  // ===== BOOKINGS =====
  bookings: {
    list: `${baseURL}/api/bookings/`,
    create: `${baseURL}/api/bookings/create/`,
    detail: (id) => `${baseURL}/api/bookings/${id}/`,
    adminList: `${baseURL}/api/bookings/admin/list/`,
    adminDetail: (id) => `${baseURL}/api/bookings/admin/${id}/`,
  },

  // ===== ANALYTICS =====
  analytics: {
    site: `${baseURL}/api/analytics/site/`,
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
 * const res = await publicAxios.get(API.promotions.active);
 * 
 * // Authenticated request
 * const res = await axiosInstance.post(API.newsletter.send, payload);
 */
