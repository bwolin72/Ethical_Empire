import baseURL from './baseURL';

const promotionsAPI = {
  list: `${baseURL}/promotions/`,                     // GET all promotions
  active: `${baseURL}/promotions/active/`,            // GET only active promotions
  detail: (id) => `${baseURL}/promotions/${id}/`,     // GET promotion by ID
  create: `${baseURL}/promotions/`,                   // POST new promotion
  update: (id) => `${baseURL}/promotions/${id}/`,     // PATCH/PUT promotion
  delete: (id) => `${baseURL}/promotions/${id}/`      // DELETE promotion
};

export default promotionsAPI;
