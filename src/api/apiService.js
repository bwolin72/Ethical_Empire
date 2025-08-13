// src/api/apiService.js
import publicAxios from '../api/publicAxios';
import axiosInstance from '../api/axiosInstance';
import API from '../api/api';

const apiService = {
  /** ================= AUTH ================= */
  login: (data) => publicAxios.post(API.auth.login, data),
  register: (data) => publicAxios.post(API.auth.register, data),
  googleLogin: (data) => publicAxios.post(API.auth.googleLogin, data),
  googleRegister: (data) => publicAxios.post(API.auth.googleRegister, data),
  logout: () => axiosInstance.post(API.auth.logout),

  getProfile: () => axiosInstance.get(API.auth.profile),
  updateProfile: (data) => axiosInstance.patch(API.auth.updateProfile, data),
  changePassword: (data) => axiosInstance.post(API.auth.changePassword, data),

  resetPassword: (data) => publicAxios.post(API.auth.resetPassword, data),
  resetPasswordConfirm: (uid, token, data) =>
    publicAxios.post(API.auth.resetPasswordConfirm(uid, token), data),

  /** Token handling */
  getToken: (data) => publicAxios.post(API.auth.token, data),
  refreshToken: (data) => publicAxios.post(API.auth.tokenRefresh, data),
  verifyToken: (data) => publicAxios.post(API.auth.tokenVerify, data),

  /** Email/OTP */
  verifyEmail: (uid, token) => publicAxios.get(API.auth.verifyEmail(uid, token)),
  resendOtp: () => publicAxios.post(API.auth.resendOtp),
  resendOtpEmail: () => publicAxios.post(API.auth.resendOtpEmail),
  verifyOtp: (data) => publicAxios.post(API.auth.verifyOtp, data),
  verifyOtpEmail: (data) => publicAxios.post(API.auth.verifyOtpEmail, data),
  resendWelcomeEmail: () => publicAxios.post(API.auth.resendWelcomeEmail),

  /** Admin account management */
  listUsers: () => axiosInstance.get(API.auth.adminListUsers),
  adminResetPassword: (data) => axiosInstance.post(API.auth.adminResetPassword, data),
  inviteWorker: (data) => axiosInstance.post(API.auth.adminInviteWorker, data),

  /** Invite workflow */
  validateWorkerInvite: (uid, token) =>
    publicAxios.get(API.auth.workerValidateInvite(uid, token)),
  completeWorkerInvite: (data) =>
    publicAxios.post(API.auth.workerCompleteInvite, data),

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
  getServiceDetail: (slug) => publicAxios.get(API.services.detail(slug)),

  /** ================= PROMOTIONS ================= */
  getPromotions: () => publicAxios.get(API.promotions.list),
  getActivePromotions: () => publicAxios.get(API.promotions.active),
  getPromotionDetail: (id) => publicAxios.get(API.promotions.detail(id)),

 /** ================= NEWSLETTER ================= */
  subscribeNewsletter: (email) => publicAxios.post(API.newsletter.subscribe, { email }),
  unsubscribeNewsletter: (email) => publicAxios.post(API.newsletter.unsubscribe, { email }),
  sendNewsletter: (data) => axiosInstance.post(API.newsletter.send, data),
  getNewsletterLogs: () => axiosInstance.get(API.newsletter.logs),

  // Confirm expects GET with token in query string, not POST
  confirmNewsletter: (token) => publicAxios.get(API.newsletter.confirm(token)),

  resendNewsletterConfirmation: (data) => publicAxios.post(API.newsletter.resendConfirmation, data),
  resubscribeNewsletter: (data) => publicAxios.post(API.newsletter.resubscribe, data),
  listNewsletterSubscribers: () => axiosInstance.get(API.newsletter.list),
  deleteNewsletterSubscriber: (id) => axiosInstance.delete(API.newsletter.delete(id)),

  /** ================= REVIEWS ================= */
  getReviews: () => publicAxios.get(API.reviews.list),
  createReview: (data) => publicAxios.post(API.reviews.create, data),
  approveReview: (id) => axiosInstance.post(API.reviews.approve(id)),
  deleteReview: (id) => axiosInstance.delete(API.reviews.delete(id)),
  replyReview: (id, data) => axiosInstance.post(API.reviews.reply(id), data),

  /** ================= BOOKINGS ================= */
  getBookings: () => publicAxios.get(`${API.bookings}/`),
  createBooking: (data) => publicAxios.post(`${API.bookings}/submit/`, data),
  getUserBookings: () => axiosInstance.get(`${API.bookings}/user/`),

  adminListBookings: () => axiosInstance.get(`${API.bookings}/admin/bookings/`),
  adminUpdateBooking: (id, data) => axiosInstance.put(`${API.bookings}/admin/bookings/${id}/update/`, data),
  adminUpdateBookingStatus: (id, data) => axiosInstance.post(`${API.bookings}/admin/bookings/${id}/status/`, data),
  adminDeleteBooking: (id) => axiosInstance.delete(`${API.bookings}/admin/bookings/${id}/delete/`),

  getBookingInvoice: (id) => axiosInstance.get(`${API.bookings}/invoice/${id}/`),

  /** ================= CONTACT ================= */
  sendContactMessage: (data) => publicAxios.post(API.contact.send, data),

  /** ================= ANALYTICS ================= */
  getSiteAnalytics: () => axiosInstance.get(API.analytics.site),
  logAnalytics: (data) => publicAxios.post(API.analytics.log, data),

  /** ================= MISC ================= */
  healthCheck: () => publicAxios.get(API.misc.health),
  getCSRFToken: () => publicAxios.get(API.misc.csrf),
};

export default apiService;
