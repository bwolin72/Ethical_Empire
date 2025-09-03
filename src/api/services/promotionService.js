import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance'; // keep for future admin-only actions
// If you have ../promotionsAPI, swap these strings for constants.
const PROMO = {
  list: '/api/promotions/',           // GET list/create
  active: '/api/promotions/active/',  // GET active
  detail: (id) => `/api/promotions/${id}/`, // GET detail
};

const promotionsService = {
  list: (params = {}) => publicAxios.get(PROMO.list, { params }),
  active: () => publicAxios.get(PROMO.active),
  detail: (id) => publicAxios.get(PROMO.detail(id)),
};

export default promotionsService;
