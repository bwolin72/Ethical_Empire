import baseURL from './baseURL';

const reviewsAPI = {
  list: `${baseURL}/reviews/`,
  create: `${baseURL}/reviews/`,
  adminList: `${baseURL}/reviews/admin/`,
  approve: (id) => `${baseURL}/reviews/${id}/approve/`,
  reply: (id) => `${baseURL}/reviews/${id}/reply/`,
  delete: (id) => `${baseURL}/reviews/${id}/delete/`,
};

export default reviewsAPI;
