// src/api/reviewsAPI.js
import axiosInstance from "./axiosInstance";
import publicAxios from "./publicAxios";

const REVIEWS_BASE = "/api/reviews/";

const reviewsAPI = {
  // ---- Public ----
  listApproved() {
    // GET /api/reviews/
    return publicAxios.get(REVIEWS_BASE);
  },

  create(payload) {
    // POST /api/reviews/
    return axiosInstance.post(REVIEWS_BASE, payload);
  },

  // ---- Admin ----
  listAllAdmin() {
    // GET /api/reviews/admin/
    return axiosInstance.get(`${REVIEWS_BASE}admin/`);
  },

  approve(id) {
    // POST /api/reviews/:id/approve/
    return axiosInstance.post(`${REVIEWS_BASE}${id}/approve/`);
  },

  reply(id, reply) {
    // POST /api/reviews/:id/reply/
    return axiosInstance.post(`${REVIEWS_BASE}${id}/reply/`, { reply });
  },

  delete(id) {
    // DELETE /api/reviews/:id/delete/
    return axiosInstance.delete(`${REVIEWS_BASE}${id}/delete/`);
  },
};

export default reviewsAPI;
