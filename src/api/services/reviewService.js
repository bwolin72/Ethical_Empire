// src/api/services/reviewService.js
// ------------------------------------------------------
// Higher-level service functions that wrap reviewsAPI.
// Can be used in React components or React Query hooks.

import reviewsAPI from '../reviewsAPI';

const reviewService = {
  /**
   * Fetch all approved reviews for public display
   * Optional category filter: { category: 'liveband' }
   */
  async getApprovedReviews(params = {}) {
    const { data } = await reviewsAPI.listApproved();
    // Filter by category if provided
    if (params.category) {
      return data.filter((r) => r.service === params.category);
    }
    return data;
  },

  /**
   * Submit a new review as the current logged-in user
   * @param {{service:string,rating:number,comment:string}} reviewData
   */
  async submitReview(reviewData) {
    const { data } = await reviewsAPI.create(reviewData);
    return data;
  },

  /**
   * Admin: get every review (approved & pending)
   */
  async getAllReviewsAdmin() {
    const { data } = await reviewsAPI.listAllAdmin();
    return data;
  },

  /**
   * Admin: approve a pending review
   * @param {number|string} id
   */
  async approveReview(id) {
    const { data } = await reviewsAPI.approve(id);
    return data;
  },

  /**
   * Admin: add or update reply to a review
   * @param {number|string} id
   * @param {string} reply
   */
  async replyToReview(id, reply) {
    const { data } = await reviewsAPI.reply(id, reply);
    return data;
  },

  /**
   * Admin: delete a review
   * @param {number|string} id
   */
  async deleteReview(id) {
    const { data } = await reviewsAPI.delete(id);
    return data;
  },
};

export default reviewService;
