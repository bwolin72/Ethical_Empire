import reviewsAPI from "../reviewsAPI";

const reviewService = {
  // Fetch approved reviews (optionally filtered by category)
  async getApprovedReviews(params = {}) {
    const response = await reviewsAPI.listApproved();
    let data = Array.isArray(response.data?.results) ? response.data.results : [];
    if (params.category) {
      data = data.filter((r) => r.service === params.category);
    }
    return data;
  },

  // Submit a new review
  async submitReview(reviewData) {
    const response = await reviewsAPI.create(reviewData);
    return response.data;
  },

  // Admin functions
  async getAllReviewsAdmin() {
    const response = await reviewsAPI.listAllAdmin();
    return response.data.results || [];
  },

  async approveReview(id) {
    const response = await reviewsAPI.approve(id);
    return response.data;
  },

  async replyToReview(id, reply) {
    const response = await reviewsAPI.reply(id, reply);
    return response.data;
  },

  async deleteReview(id) {
    const response = await reviewsAPI.delete(id);
    return response.data;
  },
};

export default reviewService;
