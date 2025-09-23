import reviewsAPI from "../reviewsAPI";

const reviewService = {
  // Fetch approved reviews
  async getApprovedReviews(params = {}) {
    const data = await reviewsAPI.listApproved();
    if (params.category) {
      return data.filter((r) => r.service === params.category);
    }
    return data;
  },

  // Submit a new review
  async submitReview(reviewData) {
    const data = await reviewsAPI.create(reviewData);
    return data;
  },

  // Admin-only functions
  async getAllReviewsAdmin() {
    return await reviewsAPI.listAllAdmin();
  },

  async approveReview(id) {
    return await reviewsAPI.approve(id);
  },

  async replyToReview(id, reply) {
    return await reviewsAPI.reply(id, reply);
  },

  async deleteReview(id) {
    return await reviewsAPI.delete(id);
  },
};

export default reviewService;
