// src/api/reviewsAPI.js
const BASE = "/reviews/";

const reviewsAPI = {
  listCreate: () => BASE,
  approve: (id) => `${BASE}${id}/approve/`,
  delete: (id) => `${BASE}${id}/delete/`,
  reply: (id) => `${BASE}${id}/reply/`,
  adminList: () => `${BASE}admin/`,
};

export default reviewsAPI;
