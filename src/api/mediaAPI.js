// src/api/mediaAPI.js
import axiosInstance from "./axiosInstance";
import publicAxios from "./publicAxios";

const BASE_URL = "/media/";

const mediaAPI = {
  /* ---------------------- PUBLIC ENDPOINTS ---------------------- */

  // List all media
  list(params = {}) {
    return publicAxios.get(`${BASE_URL}`, { params });
  },

  // List featured media
  featured(params = {}) {
    return publicAxios.get(`${BASE_URL}featured/`, { params });
  },

  // List banners
  banners(params = {}) {
    return publicAxios.get(`${BASE_URL}banners/`, { params });
  },

  // List home page media
  home(params = {}) {
    return publicAxios.get(`${BASE_URL}home/`, { params });
  },

  // List about page media
  about(params = {}) {
    return publicAxios.get(`${BASE_URL}about/`, { params });
  },

  // List vendor media
  vendor(params = {}) {
    return publicAxios.get(`${BASE_URL}vendor/`, { params });
  },

  // List partner media
  partner(params = {}) {
    return publicAxios.get(`${BASE_URL}partner/`, { params });
  },

  // List catering media
  catering(params = {}) {
    return publicAxios.get(`${BASE_URL}catering/`, { params });
  },

  // List decor media
  decor(params = {}) {
    return publicAxios.get(`${BASE_URL}decor/`, { params });
  },

  // List live band media
  liveBand(params = {}) {
    return publicAxios.get(`${BASE_URL}live-band/`, { params });
  },

  // List hosting media
  mediaHosting(params = {}) {
    return publicAxios.get(`${BASE_URL}media-hosting/`, { params });
  },

  // List user media (logged-in user's uploads)
  user(params = {}) {
    return axiosInstance.get(`${BASE_URL}user/`, { params });
  },

  // List all (admin)
  all(params = {}) {
    return axiosInstance.get(`${BASE_URL}all/`, { params });
  },

  // List archived media
  archived(params = {}) {
    return axiosInstance.get(`${BASE_URL}archived/`, { params });
  },

  // Stats endpoint
  stats() {
    return axiosInstance.get(`${BASE_URL}stats/`);
  },

  // Debug proto endpoint
  debugProto() {
    return publicAxios.get(`${BASE_URL}debug/proto/`);
  },

  /* ---------------------- ADMIN ENDPOINTS ---------------------- */

  // Upload new media
  upload(files, extra = {}, onUploadProgress) {
    const formData = new FormData();
    [...files].forEach((file) => formData.append("media", file));

    Object.entries(extra).forEach(([key, val]) => {
      if (Array.isArray(val)) val.forEach((v) => formData.append(key, v));
      else formData.append(key, val);
    });

    return axiosInstance.post(`${BASE_URL}upload/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
      onUploadProgress: (evt) => {
        if (onUploadProgress && evt.total) {
          const percent = Math.round((evt.loaded * 100) / evt.total);
          onUploadProgress(percent);
        }
      },
    });
  },

  // Update existing media (PATCH)
  update(id, payload) {
    return axiosInstance.patch(`${BASE_URL}${id}/update/`, payload);
  },

  // Toggle active status
  toggleActive(id) {
    return axiosInstance.patch(`${BASE_URL}${id}/toggle/`);
  },

  // Toggle featured status
  toggleFeatured(id) {
    return axiosInstance.patch(`${BASE_URL}${id}/toggle/featured/`);
  },

  // Soft delete
  delete(id) {
    return axiosInstance.delete(`${BASE_URL}${id}/delete/`);
  },

  // Restore soft-deleted media
  restore(id) {
    return axiosInstance.post(`${BASE_URL}${id}/restore/`);
  },

  // Reorder media items
  reorder(orderArray) {
    return axiosInstance.post(`${BASE_URL}reorder/`, orderArray);
  },
};

export default mediaAPI;
