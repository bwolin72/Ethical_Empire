// src/api/services/promotionService.js

import apiInstance from "../axiosInstance";
import publicAxios from "../publicAxios";
import promotionsAPI from "../promotionsAPI";

const promotionService = {
  // Public GET
  list: (params) => publicAxios.get(promotionsAPI.list(), { params }),
  active: (params) => publicAxios.get(promotionsAPI.active(), { params }),
  detail: (id) => publicAxios.get(promotionsAPI.detail(id)),

  // Authenticated CRUD
  create: (data) => apiInstance.post(promotionsAPI.create(), data),
  update: (id, data) => apiInstance.patch(promotionsAPI.update(id), data),
  remove: (id) => apiInstance.delete(promotionsAPI.delete(id)),
};

export default promotionService;
