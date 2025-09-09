// src/api/services/videoService.js

import apiInstance from "../axiosInstance";
import publicAxios from "../publicAxios";
import videosAPI from "../videosAPI";

const videoService = {
  // Public GET
  list: (params) => publicAxios.get(videosAPI.list(), { params }),
  active: (params) => publicAxios.get(videosAPI.active(), { params }),
  detail: (id) => publicAxios.get(videosAPI.detail(id)),

  // Authenticated CRUD
  create: (data) => apiInstance.post(videosAPI.create(), data),
  update: (id, data) => apiInstance.patch(videosAPI.update(id), data),
  remove: (id) => apiInstance.delete(videosAPI.delete(id)),
};

export default videoService;
