import axiosInstance from "./axiosInstance";
import publicAxios from "./publicAxios";

const PROMOTIONS_BASE = "/api/promotions/";

const promotionsAPI = {
  // ---- Public Endpoints ----
  list(params) {
    // GET /api/promotions/
    return publicAxios.get(PROMOTIONS_BASE, { params });
  },

  active(params) {
    // GET /api/promotions/active/
    return publicAxios.get(`${PROMOTIONS_BASE}active/`, { params });
  },

  detail(id) {
    // GET /api/promotions/:id/
    return publicAxios.get(`${PROMOTIONS_BASE}${id}/`);
  },

  // ---- Admin Endpoints ----
  create(data) {
    // POST /api/promotions/
    return axiosInstance.post(PROMOTIONS_BASE, data);
  },

  update(id, data) {
    // PUT /api/promotions/:id/
    return axiosInstance.put(`${PROMOTIONS_BASE}${id}/`, data);
  },

  patch(id, data) {
    // PATCH /api/promotions/:id/
    return axiosInstance.patch(`${PROMOTIONS_BASE}${id}/`, data);
  },

  delete(id) {
    // DELETE /api/promotions/:id/
    return axiosInstance.delete(`${PROMOTIONS_BASE}${id}/`);
  },
};

export default promotionsAPI;

