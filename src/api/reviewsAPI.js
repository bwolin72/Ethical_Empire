// src/api/reviewsAPI.js
// ------------------------------------------------------
// Centralized API calls for the Reviews app.
// Uses axiosInstance (for authenticated requests) and publicAxios (for public endpoints).

import axiosInstance from './axiosInstance';
import publicAxios from './publicAxios';

const REVIEWS_BASE = '/api/reviews/';

const reviewsAPI = {
  /**
   * Public: list only approved reviews
   * GET /api/reviews/
   */
  listApproved() {
    return publicAxios.get(REVIEWS_BASE);
  },

  /**
   * Authenticated user: submit a new review (requires login)
   * POST /api/reviews/
   * @param {Object} payload { service, rating, comment }
   */
  create(payload) {
    return axiosInstance.post(REVIEWS_BASE, payload);
  },

  /**
   * Admin: list all reviews (approved & pending)
   * GET /api/reviews/admin/
   */
  listAllAdmin() {
    return axiosInstance.get(`${REVIEWS_BASE}admin/`);
  },

  /**
   * Admin: approve a pending review
   * POST /api/reviews/:id/approve/
   */
  approve(id) {
    return axiosInstance.post(`${REVIEWS_BASE}${id}/approve/`);
  },

  /**
   * Admin: add or update a reply to a review
   * POST /api/reviews/:id/reply/
   * @param {number|string} id
   * @param {string} reply
   */
  reply(id, reply) {
    return axiosInstance.post(`${REVIEWS_BASE}${id}/reply/`, { reply });
  },

  /**
   * Admin: delete a review
   * DELETE /api/reviews/:id/delete/
   */
  delete(id) {
    return axiosInstance.delete(`${REVIEWS_BASE}${id}/delete/`);
  },
};

export default reviewsAPI;
