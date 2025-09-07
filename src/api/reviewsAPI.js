// src/api/reviewsAPI.js
import baseURL from './baseURL';

const reviewsAPI = {
  // Public
  list: `${baseURL}/reviews/`,                     // GET approved reviews
  create: `${baseURL}/reviews/`,                   // POST new review

  // Admin-only
  adminList: `${baseURL}/reviews/admin/`,          // GET all reviews (admin only)
  approve: (id) => `${baseURL}/reviews/${id}/approve/`, // POST approve
  reply: (id) => `${baseURL}/reviews/${id}/reply/`,     // POST reply
  delete: (id) => `${baseURL}/reviews/${id}/delete/`,   // DELETE review (correct path)
};

export default reviewsAPI;
