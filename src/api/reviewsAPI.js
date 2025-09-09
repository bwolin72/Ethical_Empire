// src/api/reviewsAPI.js
const BASE = "/api/reviews/"; // matches Django backend prefix

const reviewsAPI = {
  list: (params) => ({ url: BASE, method: "get", params }), // public approved reviews
  create: (data) => ({ url: BASE, method: "post", data }), // authenticated user

  // Admin actions
  approve: (id) => ({ url: `${BASE}${id}/approve/`, method: "post" }),
  delete: (id) => ({ url: `${BASE}${id}/delete/`, method: "delete" }),
  reply: (id, data) => ({ url: `${BASE}${id}/reply/`, method: "post", data }),
  adminList: (params) => ({ url: `${BASE}admin/`, method: "get", params }),
};

export default reviewsAPI;
