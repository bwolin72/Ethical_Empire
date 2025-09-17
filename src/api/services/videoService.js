// src/api/services/videoService.js
import publicAxios from "../publicAxios";
import axiosInstance from "../axiosInstance";
import videosAPI from "../videosAPI";

const videoService = {
  // -------- Public (no auth) --------
  list: (params) => publicAxios.get(videosAPI.list, { params }),
  active: (params) => publicAxios.get(videosAPI.active, { params }),
  detail: (id) => publicAxios.get(videosAPI.detail(id)),

  // -------- Authenticated (admin / dashboard) --------
  create: (data) => axiosInstance.post(videosAPI.create, data),
  update: (id, data) => axiosInstance.patch(videosAPI.update(id), data),
  delete: (id) => axiosInstance.delete(videosAPI.delete(id)),
};

export default videoService;
