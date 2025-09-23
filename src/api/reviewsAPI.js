import axiosInstance from "./axiosInstance";
import publicAxios from "./publicAxios";

const REVIEWS_BASE = "/api/reviews/";

const reviewsAPI = {
  // ---- Public ----

  /**
   * GET /api/reviews/
   * Returns only approved reviews (no auth required).
   */
  listApproved() {
    return publicAxios.get(REVIEWS_BASE);
  },

  /**
   * POST /api/reviews/
   * Create a new review (requires auth, unapproved until admin approves).
   */
  create(payload) {
    return axiosInstance.post(REVIEWS_BASE, payload);
  },

  // ---- Admin ----

  /**
   * GET /api/reviews/admin/
   * Fetch all reviews (approved + pending).
   */
  listAllAdmin() {
    return axiosInstance.get(`${REVIEWS_BASE}admin/`);
  },

  /**
   * POST /api/reviews/:id/approve/
   * Approve a review by ID.
   */
  approve(id) {
    return axiosInstance.post(`${REVIEWS_BASE}${id}/approve/`);
  },

  /**
   * POST /api/reviews/:id/reply/
   * Add/update reply text for a review.
   */
  reply(id, reply) {
    return axiosInstance.post(`${REVIEWS_BASE}${id}/reply/`, { reply });
  },

  /**
   * DELETE /api/reviews/:id/delete/
   * Delete a review permanently.
   */
  delete(id) {
    return axiosInstance.delete(`${REVIEWS_BASE}${id}/delete/`);
  },
};

export default reviewsAPI;
