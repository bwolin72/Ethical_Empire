// src/api/promotionsAPI.js

const BASE = "/promotions/";

const promotionsAPI = {
  list: () => `${BASE}`,
  active: () => `${BASE}active/`,
  detail: (id) => `${BASE}${id}/`,
  create: () => `${BASE}create/`,
  update: (id) => `${BASE}${id}/update/`,
  delete: (id) => `${BASE}${id}/delete/`,
};

export default promotionsAPI;
