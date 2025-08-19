import baseURL from './baseURL';

const promotionsAPI = {
  list: `${baseURL}/promotions/`,
  active: `${baseURL}/promotions/active/`,
  detail: (id) => `${baseURL}/promotions/${id}/`,
};

export default promotionsAPI;
