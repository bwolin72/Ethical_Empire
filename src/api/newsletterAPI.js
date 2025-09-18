// src/api/newsletterAPI.js
import axiosInstance from "./axiosInstance";
import publicAxios from "./publicAxios";

const NEWSLETTER_BASE = "/newsletter/";

const newsletterAPI = {
  // ---- Public ----
  subscribe(payload) {
    // POST /api/newsletter/subscribe/
    return publicAxios.post(`${NEWSLETTER_BASE}subscribe/`, payload);
  },

  confirm(token) {
    // GET /api/newsletter/confirm/?token=...
    return publicAxios.get(`${NEWSLETTER_BASE}confirm/`, {
      params: { token },
    });
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
    return publicAxios.post(`${NEWSLETTER_BASE}resend-confirmation/`, {
      email,
    });
  },

  // ---- Admin ----
  listSubscribers() {
    // GET /api/newsletter/list/
    return axiosInstance.get(`${NEWSLETTER_BASE}list/`);
  },

  countSubscribers() {
    // GET /api/newsletter/count/
    return axiosInstance.get(`${NEWSLETTER_BASE}count/`);
  },

  logs() {
    // GET /api/newsletter/logs/
    return axiosInstance.get(`${NEWSLETTER_BASE}logs/`);
  },

  send(payload) {
    // POST /api/newsletter/send/
    return axiosInstance.post(`${NEWSLETTER_BASE}send/`, payload);
  },

  deleteSubscriber(id) {
    // DELETE /api/newsletter/delete/:id/
    return axiosInstance.delete(`${NEWSLETTER_BASE}delete/${id}/`);
  },
};

export default newsletterAPI;
