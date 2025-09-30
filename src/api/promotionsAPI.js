import axiosInstance from "./axiosInstance";
import publicAxios from "./publicAxios";

const PROMOTIONS_BASE = "/promotions/"; // matches Django URLs

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
    if (id === undefined || id === null) {
      throw new Error("Promotion ID is required for detail API call.");
    }
    // GET /api/promotions/:id/
    return publicAxios.get(`${PROMOTIONS_BASE}${id}/`);
  },

  // ---- Admin Endpoints ----
  create(data) {
    // POST /api/promotions/
    return axiosInstance.post(PROMOTIONS_BASE, data);
  },

  update(id, data) {
    if (id === undefined || id === null) {
      throw new Error("Promotion ID is required for update API call.");
    }
    // PUT /api/promotions/:id/
    return axiosInstance.put(`${PROMOTIONS_BASE}${id}/`, data);
  },

  patch(id, data) {
    if (id === undefined || id === null) {
      throw new Error("Promotion ID is required for patch API call.");
    }
    // PATCH /api/promotions/:id/
    return axiosInstance.patch(`${PROMOTIONS_BASE}${id}/`, data);
  },

  delete(id) {
    if (id === undefined || id === null) {
      throw new Error("Promotion ID is required for delete API call.");
    }
    // DELETE /api/promotions/:id/
    return axiosInstance.delete(`${PROMOTIONS_BASE}${id}/`);
  },
};

export default promotionsAPI;
