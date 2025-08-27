import baseURL from './baseURL';

const reviewsAPI = {
  list: `${baseURL}/reviews/`,                   // GET approved reviews
  create: `${baseURL}/reviews/`,                 // POST new review
  adminList: `${baseURL}/reviews/admin/`,        // GET all (admin only)
  approve: (id) => `${baseURL}/reviews/${id}/approve/`, 
  reply: (id) => `${baseURL}/reviews/${id}/reply/`,     
  delete: (id) => `${baseURL}/reviews/${id}/delete/`,   
};

export default reviewsAPI;
