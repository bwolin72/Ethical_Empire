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

  /** Email & OTP */
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
  getMessages: () => axiosInstance.get(API.messaging.list),
  getMessageDetail: (id) => axiosInstance.get(API.messaging.detail(id)),
  sendMessage: (data) => axiosInstance.post(API.messaging.list, data),
  updateMessage: (id, data) => axiosInstance.patch(API.messaging.detail(id), data),
  deleteMessage: (id) => axiosInstance.delete(API.messaging.detail(id)),
  markMessageRead: (id) => axiosInstance.patch(API.messaging.detail(id), { is_read: true }),

  /** ================= MEDIA ================= */
  getMedia: () => publicAxios.get(API.media.defaultList),
  getBanners: () => publicAxios.get(API.media.banners),
  getFeaturedMedia: () => publicAxios.get(API.media.featured),
  getArchivedMedia: () => publicAxios.get(API.media.archived),
  getMediaItems: () => publicAxios.get(API.media.mediaItems),

  getHomeMedia: () => publicAxios.get(API.media.home),
  getAboutMedia: () => publicAxios.get(API.media.about),
  getDecorMedia: () => publicAxios.get(API.media.decor),
  getLiveBandMedia: () => publicAxios.get(API.media.liveBand),
  getCateringMedia: () => publicAxios.get(API.media.catering),
  getMediaHostingMedia: () => publicAxios.get(API.media.mediaHosting),
  getVendorMedia: () => publicAxios.get(API.media.vendor),
  getPartnerMedia: () => publicAxios.get(API.media.partner),
  getUserMedia: () => publicAxios.get(API.media.userMedia),

  uploadMedia: (data) => axiosInstance.post(API.media.upload, data),
  updateMedia: (id, data) => axiosInstance.patch(API.media.update(id), data),
  toggleMediaActive: (id) => axiosInstance.post(API.media.toggle(id)),
  toggleMediaFeatured: (id) => axiosInstance.post(API.media.toggleFeatured(id)),
  deleteMedia: (id) => axiosInstance.delete(API.media.delete(id)),
  restoreMedia: (id) => axiosInstance.post(API.media.restore(id)),
  reorderMedia: (data) => axiosInstance.post(API.media.reorder, data),
  getMediaStats: () => axiosInstance.get(API.media.stats),
  debugMediaProto: () => axiosInstance.get(API.media.debugProto),

  /** ================= VIDEOS ================= */
  getVideos: (params = {}) => publicAxios.get(API.videos.list, { params }),
  getVideoDetail: (id) => publicAxios.get(API.videos.detail(id)),
  createVideo: (data) => axiosInstance.post(API.videos.list, data),
  updateVideo: (id, data) => axiosInstance.patch(API.videos.detail(id), data),
  deleteVideo: (id) => axiosInstance.delete(API.videos.detail(id)),
  toggleVideoActive: (id) => axiosInstance.post(API.videos.toggleActive(id)),
  toggleVideoFeatured: (id) => axiosInstance.post(API.videos.toggleFeatured(id)),

  getHomeVideos: () => publicAxios.get(API.videos.home),
  getAboutVideos: () => publicAxios.get(API.videos.about),
  getDecorVideos: () => publicAxios.get(API.videos.decor),
  getLiveBandVideos: () => publicAxios.get(API.videos.liveBand),
  getCateringVideos: () => publicAxios.get(API.videos.catering),
  getMediaHostingVideos: () => publicAxios.get(API.videos.mediaHosting),
  getVendorVideos: () => publicAxios.get(API.videos.vendor),
  getPartnerVideos: () => publicAxios.get(API.videos.partner),
  getUserVideos: () => publicAxios.get(API.videos.user),

  /** ================= SERVICES ================= */
  getServices: () => publicAxios.get(API.services.list),
  getServiceDetail: (slug) => publicAxios.get(API.services.detail(slug)),

  /** ================= PROMOTIONS ================= */
  getPromotions: () => publicAxios.get(API.promotions.list),
  createPromotion: (data) => axiosInstance.post(API.promotions.list, data),
  getActivePromotions: () => publicAxios.get(API.promotions.active),
  getPromotionDetail: (id) => publicAxios.get(API.promotions.detail(id)),
  updatePromotion: (id, data) => axiosInstance.patch(API.promotions.detail(id), data),
  deletePromotion: (id) => axiosInstance.delete(API.promotions.detail(id)),

  /** ================= NEWSLETTER ================= */
  subscribeNewsletter: (email, name = '', token) =>
    publicAxios.post(API.newsletter.subscribe, { email, name, token }),
  unsubscribeNewsletter: (email) =>
    publicAxios.post(API.newsletter.unsubscribe, { email }),
  sendNewsletter: (data) => axiosInstance.post(API.newsletter.send, data),
  getNewsletterLogs: () => axiosInstance.get(API.newsletter.logs),
  confirmNewsletter: (token) => publicAxios.get(API.newsletter.confirm(token)),
  resendNewsletterConfirmation: (email) =>
    publicAxios.post(API.newsletter.resendConfirmation, { email }),
  resubscribeNewsletter: (email) => publicAxios.post(API.newsletter.resubscribe, { email }),
  listNewsletterSubscribers: () => axiosInstance.get(API.newsletter.list),
  deleteNewsletterSubscriber: (id) => axiosInstance.delete(API.newsletter.delete(id)),
  getNewsletterCount: () => axiosInstance.get(API.newsletter.count),

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
  getUserBookingHistory: () => axiosInstance.get(`${API.bookings}/user/history/`),
  updateUserBooking: (id, data) => axiosInstance.patch(`${API.bookings}/${id}/`, data),
  deleteUserBooking: (id) => axiosInstance.delete(`${API.bookings}/${id}/`),
  getBookingInvoice: (id) => axiosInstance.get(`${API.bookings}/invoice/${id}/`),

  adminListBookings: () => axiosInstance.get(`${API.bookings}/admin/bookings/`),
  adminUpdateBooking: (id, data) =>
    axiosInstance.patch(`${API.bookings}/admin/bookings/${id}/update/`, data),
  adminUpdateBookingStatus: (id, data) =>
    axiosInstance.post(`${API.bookings}/admin/bookings/${id}/status/`, data),
  adminDeleteBooking: (id) =>
    axiosInstance.delete(`${API.bookings}/admin/bookings/${id}/delete/`),

  /** ================= INVOICES ================= */
  listInvoices: (params = {}) => axiosInstance.get(API.invoices.list, { params }),
  createInvoice: (data) => axiosInstance.post(API.invoices.list, data),
  getInvoiceDetail: (id) => axiosInstance.get(API.invoices.detail(id)),
  updateInvoice: (id, data) => axiosInstance.patch(API.invoices.detail(id), data),
  deleteInvoice: (id) => axiosInstance.delete(API.invoices.detail(id)),
  downloadInvoicePdf: (id) =>
    axiosInstance.get(API.invoices.downloadPdf(id), { responseType: 'blob' }),
  sendInvoiceEmail: (id) => axiosInstance.post(API.invoices.sendEmail(id)),

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
