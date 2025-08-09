// src/services/apiService.js
import publicAxios from '../api/publicAxios';
import axiosInstance from '../api/axiosInstance';
import API from '../api/api';

const apiService = {
  /** ================= AUTH ================= */
  login: (data) => publicAxios.post(API.auth.login, data),
  register: (data) => publicAxios.post(API.auth.register, data),
  logout: () => axiosInstance.post(API.auth.logout),
  getProfile: () => axiosInstance.get(API.auth.profile),
  updateProfile: (data) => axiosInstance.put(API.auth.updateProfile, data),
  changePassword: (data) => axiosInstance.post(API.auth.changePassword, data),
  resetPassword: (data) => publicAxios.post(API.auth.resetPassword, data),
  resetPasswordConfirm: (data) => publicAxios.post(API.auth.resetPasswordConfirm, data),

  /** Admin account management */
  listUsers: () => axiosInstance.get(API.auth.adminListUsers),
  adminResetPassword: (data) => axiosInstance.post(API.auth.adminResetPassword, data),
  inviteWorker: (data) => axiosInstance.post(API.auth.adminInviteWorker, data),

  /** Invite workflow */
  validateWorkerInvite: (uid, token) =>
    publicAxios.get(API.auth.workerValidateInvite(uid, token)),
  completeWorkerInvite: (data) => publicAxios.post(API.auth.workerCompleteInvite, data),

  /** ================= MESSAGING ================= */
  sendMessage: (data) => axiosInstance.post(API.messaging.sendMessage, data),
  sendSpecialOffer: (data) => axiosInstance.post(API.messaging.specialOffer, data),

  /** ================= MEDIA ================= */
  getBanners: () => publicAxios.get(API.media.banners),
  getMediaItems: () => publicAxios.get(API.media.mediaItems),
  getAboutMedia: () => publicAxios.get(API.media.about),
  getLiveBandMedia: () => publicAxios.get(API.media.liveBand),
  getCateringMedia: () => publicAxios.get(API.media.catering),
  getDecorMedia: () => publicAxios.get(API.media.decor),
  getMediaHostingMedia: () => publicAxios.get(API.media.mediaHosting),

  /** ================= VIDEOS ================= */
  getVideos: (params = {}) => publicAxios.get(API.videos.list, { params }),
  getVideoDetail: (id) => publicAxios.get(API.videos.detail(id)),
  toggleVideoActive: (id) => axiosInstance.post(API.videos.toggleActive(id)),
  toggleVideoFeatured: (id) => axiosInstance.post(API.videos.toggleFeatured(id)),

  /** ================= SERVICES ================= */
  getServices: () => publicAxios.get(API.services.list),
  getServiceDetail: (id) => publicAxios.get(API.services.detail(id)),

  /** ================= PROMOTIONS ================= */
  getPromotions: () => publicAxios.get(API.promotions.list),
  getActivePromotions: () => publicAxios.get(API.promotions.active),
  getPromotionDetail: (id) => publicAxios.get(API.promotions.detail(id)),

  /** ================= NEWSLETTER ================= */
  subscribeNewsletter: (email) => publicAxios.post(API.newsletter.subscribe, { email }),
  unsubscribeNewsletter: (email) => publicAxios.post(API.newsletter.unsubscribe, { email }),
  sendNewsletter: (data) => axiosInstance.post(API.newsletter.send, data),
  getNewsletterLogs: () => axiosInstance.get(API.newsletter.logs),

  /** ================= REVIEWS ================= */
  getReviews: () => publicAxios.get(API.reviews.list),
  createReview: (data) => publicAxios.post(API.reviews.create, data),

  /** ================= BOOKINGS ================= */
  getBookings: () => axiosInstance.get(API.bookings.list),
  createBooking: (data) => publicAxios.post(API.bookings.create, data),
  getBookingDetail: (id) => axiosInstance.get(API.bookings.detail(id)),
  adminListBookings: () => axiosInstance.get(API.bookings.adminList),
  adminBookingDetail: (id) => axiosInstance.get(API.bookings.adminDetail(id)),

  /** ================= ANALYTICS ================= */
  getSiteAnalytics: () => axiosInstance.get(API.analytics.site),

  /** ================= MISC ================= */
  healthCheck: () => publicAxios.get(API.misc.health),
  getCSRFToken: () => publicAxios.get(API.misc.csrf),
};

export default apiService;
