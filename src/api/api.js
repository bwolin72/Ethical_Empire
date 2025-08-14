// src/api/api.js
import baseURL from './baseURL';

const API = {
  // ===== PROMOTIONS =====
  promotions: {
    list: `${baseURL}/promotions/`,
    active: `${baseURL}/promotions/active/`,
    detail: (id) => `${baseURL}/promotions/${id}/`,
  },

  // ===== MESSAGING =====
  messaging: {
    list: `${baseURL}/messaging/messages/`,
    detail: (id) => `${baseURL}/messaging/messages/${id}/`,
    sendMessage: `${baseURL}/messaging/messages/`,
    markRead: (id) => `${baseURL}/messaging/messages/${id}/mark-read/`,
    markUnread: (id) => `${baseURL}/messaging/messages/${id}/mark-unread/`,
    unread: `${baseURL}/messaging/messages/unread/`,
    specialOffer: `${baseURL}/accounts/profiles/special-offer/`,
  },

  // ===== VIDEOS =====
  videos: {
    list: `${baseURL}/videos/videos/`,
    detail: (id) => `${baseURL}/videos/videos/${id}/`,
    toggleActive: (id) => `${baseURL}/videos/videos/${id}/toggle_active/`,
    toggleFeatured: (id) => `${baseURL}/videos/videos/${id}/toggle_featured/`,
    home: `${baseURL}/videos/videos/home/`,
    about: `${baseURL}/videos/videos/about/`,
    decor: `${baseURL}/videos/videos/decor/`,
    liveBand: `${baseURL}/videos/videos/live_band/`,
    catering: `${baseURL}/videos/videos/catering/`,
    mediaHosting: `${baseURL}/videos/videos/media_hosting/`,
    vendor: `${baseURL}/videos/videos/vendor/`,
    partner: `${baseURL}/videos/videos/partner/`,
    user: `${baseURL}/videos/videos/user/`,
  },

  // ===== SERVICES =====
  services: {
    list: `${baseURL}/services/`,
    detail: (slug) => `${baseURL}/services/${slug}/`,
  },

  // ===== INVOICES =====
  invoices: {
    list: `${baseURL}/invoices/invoices/`,
    detail: (id) => `${baseURL}/invoices/invoices/${id}/`,
    downloadPdf: (id) => `${baseURL}/invoices/invoices/${id}/download_pdf/`,
    sendEmail: (id) => `${baseURL}/invoices/invoices/${id}/send_email/`,
  },

  // ===== NEWSLETTER =====
  newsletter: {
    subscribe: `${baseURL}/newsletter/subscribe/`,
    unsubscribe: `${baseURL}/newsletter/unsubscribe/`,
    send: `${baseURL}/newsletter/send/`,
    logs: `${baseURL}/newsletter/logs/`,
    confirm: (token) => `${baseURL}/newsletter/confirm/?token=${token}`,
    resendConfirmation: `${baseURL}/newsletter/resend-confirmation/`,
    resubscribe: `${baseURL}/newsletter/resubscribe/`,
    list: `${baseURL}/newsletter/subscribers/`,
    delete: (id) => `${baseURL}/newsletter/subscribers/${id}/`,
  },

  // ===== REVIEWS =====
  reviews: {
    list: `${baseURL}/reviews/`,
    create: `${baseURL}/reviews/`,
    adminList: `${baseURL}/reviews/admin/`,
    approve: (id) => `${baseURL}/reviews/${id}/approve/`,
    reply: (id) => `${baseURL}/reviews/${id}/reply/`,
    delete: (id) => `${baseURL}/reviews/${id}/delete/`,
  },

  // ===== CONTACT =====
  contact: {
    sendMessage: `${baseURL}/contact/send/`,
  },

  // ===== ANALYTICS =====
  analytics: {
    logVisit: `${baseURL}/analytics/log/`,
    pageStats: `${baseURL}/analytics/stats/`,
  },

  // ===== MISC =====
  misc: {
    health: `${baseURL}/health/`,
    csrf: `${baseURL}/csrf/`,
  },
};

export default API;
