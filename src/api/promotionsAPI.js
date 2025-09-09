// src/api/promotionsAPI.js
const BASE = "/api/promotions/"; // matches Django backend prefix

const promotionsAPI = {
  list: (params) => ({ url: BASE, method: "get", params }),
  active: (params) => ({ url: `${BASE}active/`, method: "get", params }),
  detail: (id) => ({ url: `${BASE}${id}/`, method: "get" }),
  create: (data) => ({ url: BASE, method: "post", data }),
  update: (id, data) => ({ url: `${BASE}${id}/`, method: "put", data }), // matches DRF RetrieveUpdateDestroyAPIView
  delete: (id) => ({ url: `${BASE}${id}/`, method: "delete" }),
};

export default promotionsAPI;
