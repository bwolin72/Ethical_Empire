import reviewsAPI from "../reviewsAPI";

const reviewService = {
  /**
   * Fetch approved reviews for public display.
   * Optional filter: { category: "liveband" }
   */
  async getApprovedReviews(params = {}) {
    const { data } = await reviewsAPI.listApproved();
    if (params.category) {
      return data.filter((r) => r.service === params.category);
    }
    return data;
  },

  /**
   * Submit a new review (current logged-in user).
   * Review is unapproved until admin approves.
   */
  async submitReview(reviewData) {
    const { data } = await reviewsAPI.create(reviewData);
    return data;
  },

  // -------- Admin Only --------

  async getAllReviewsAdmin() {
    const { data } = await reviewsAPI.listAllAdmin();
    return data;
  },

  async approveReview(id) {
    const { data } = await reviewsAPI.approve(id);
    return data;
  },

  async replyToReview(id, reply) {
    const { data } = await reviewsAPI.reply(id, reply);
    return data;
  },

  async deleteReview(id) {
    const { data } = await reviewsAPI.delete(id);
    return data;
  },
};

export default reviewService;
