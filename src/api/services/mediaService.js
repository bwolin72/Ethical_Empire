// src/api/services/mediaService.js
import axiosInstance from "../axiosInstance";
import publicAxios from "../publicAxios";
import endpointMap from "./endpointMap";

const MEDIA_BASE = endpointMap.media.all; // "media"

// helper to build a standard + active variant
const makeEndpoint = (endpoint) => ({
  get: (params = {}) => publicAxios.get(`/${endpoint}/`, { params }),
  active: (params = {}) =>
    publicAxios.get(`/${endpoint}/`, { params: { is_active: true, ...params } }),
});

const mediaService = {
  /* ------------------ PUBLIC ENDPOINTS ------------------ */
  list: (params = {}) =>
    publicAxios.get(`/${MEDIA_BASE}/`, { params }),

  stats: () =>
    publicAxios.get(`/${endpointMap.analytics.stats}/`),

  // auto-generate endpoints from endpointMap
  ...Object.keys(endpointMap.media).reduce((acc, key) => {
    if (key === "all") return acc; // skip base
    const endpoint = endpointMap.media[key];
    acc[key] = (params = {}) =>
      publicAxios.get(`/${endpoint}/`, { params });
    acc[`${key}Active`] = (params = {}) =>
      publicAxios.get(`/${endpoint}/`, { params: { is_active: true, ...params } });
    return acc;
  }, {}),

  /* ------------------ ADMIN ENDPOINTS ------------------ */
  upload: (files, extra = {}) => {
    const formData = new FormData();
    [...files].forEach((file) => formData.append("media", file));

    Object.entries(extra).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        val.forEach((v) => formData.append(key, v));
      } else {
        formData.append(key, val);
      }
    });

    return axiosInstance.post(`/${MEDIA_BASE}/upload/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (id, payload) =>
    axiosInstance.patch(`/${MEDIA_BASE}/${id}/update/`, payload),

  toggleActive: (id) =>
    axiosInstance.patch(`/${MEDIA_BASE}/${id}/toggle/`),

  toggleFeatured: (id) =>
    axiosInstance.patch(`/${MEDIA_BASE}/${id}/toggle/featured/`),

  softDelete: (id) =>
    axiosInstance.delete(`/${MEDIA_BASE}/${id}/delete/`),

  restore: (id) =>
    axiosInstance.post(`/${MEDIA_BASE}/${id}/restore/`),

  listAll: (params = {}) =>
    axiosInstance.get(`/${MEDIA_BASE}/all/`, { params }),

  listArchived: (params = {}) =>
    axiosInstance.get(`/${MEDIA_BASE}/archived/`, { params }),

  reorder: (orderArray) =>
    axiosInstance.post(`/${MEDIA_BASE}/reorder/`, orderArray),

  debugProto: () =>
    publicAxios.get(`/${MEDIA_BASE}/debug/proto/`),
};

export default mediaService;
