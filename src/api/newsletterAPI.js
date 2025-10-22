// src/api/newsletterAPI.js
import axiosInstance from "./axiosInstance";
import publicAxios from "./publicAxios";

const NEWSLETTER_BASE = "/newsletter/";

const newsletterAPI = {
  // ---- Public Endpoints ----

  subscribe(payload) {
    // POST /api/newsletter/subscribe/
    return publicAxios.post(`${NEWSLETTER_BASE}subscribe/`, payload);
  },

  confirmSubscription(token) {
    // GET /api/newsletter/confirm/?token=...
    return publicAxios.get(`${NEWSLETTER_BASE}confirm/`, { params: { token } });
  },

  unsubscribe(email) {
    // POST /api/newsletter/unsubscribe/
    return publicAxios.post(`${NEWSLETTER_BASE}unsubscribe/`, { email });
  },

  resubscribe(email) {
    // POST /api/newsletter/resubscribe/
    return publicAxios.post(`${NEWSLETTER_BASE}resubscribe/`, { email });
  },

  resendConfirmation(email) {
    // POST /api/newsletter/resend-confirmation/
    return publicAxios.post(`${NEWSLETTER_BASE}resend-confirmation/`, { email });
  },

  // ---- Admin Endpoints ----

  fetchSubscribers() {
    // GET /api/newsletter/subscribers/
    return axiosInstance.get(`${NEWSLETTER_BASE}subscribers/`);
  },

  fetchSubscriberCount() {
    // GET /api/newsletter/subscribers/count/
    return axiosInstance.get(`${NEWSLETTER_BASE}subscribers/count/`);
  },

  fetchNewsletterLogs() {
    // GET /api/newsletter/logs/
    return axiosInstance.get(`${NEWSLETTER_BASE}logs/`);
  },

  sendNewsletter(payload) {
    // POST /api/newsletter/send/
    return axiosInstance.post(`${NEWSLETTER_BASE}send/`, payload);
  },

  deleteSubscriber(id) {
    // DELETE /api/newsletter/subscribers/:id/
    return axiosInstance.delete(`${NEWSLETTER_BASE}subscribers/${id}/`);
  },
};

export default newsletterAPI;
