import baseURL from './baseURL';

const promotionsAPI = {
  list: `${baseURL}/api/promotions/promotions/`,                     // GET all promotions
  active: `${baseURL}/api/promotions/promotions/active/`,            // GET only active promotions
  detail: (id) => `${baseURL}/api/promotions/promotions/${id}/`,     // GET promotion by ID
  create: `${baseURL}/api/promotions/promotions/`,                   // POST new promotion
  update: (id) => `${baseURL}/api/promotions/promotions/${id}/`,     // PATCH/PUT promotion
  delete: (id) => `${baseURL}/api/promotions/promotions/${id}/`      // DELETE promotion
};

export default promotionsAPI;
