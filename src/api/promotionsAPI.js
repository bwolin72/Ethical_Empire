import baseURL from './baseURL';

const promotionsAPI = {
  list: `${baseURL}/promotions/promotions/`,                     // GET all promotions
  active: `${baseURL}/promotions/promotions/active/`,            // GET only active promotions
  detail: (id) => `${baseURL}/promotions/promotions/${id}/`,     // GET promotion by ID
  create: `${baseURL}/promotions/promotions/`,                   // POST new promotion
  update: (id) => `${baseURL}/promotions/promotions/${id}/`,     // PATCH/PUT promotion
  delete: (id) => `${baseURL}/promotions/promotions/${id}/`      // DELETE promotion
};

export default promotionsAPI;
