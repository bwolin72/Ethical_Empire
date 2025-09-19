// src/api/services/mediaService.js
import axiosInstance from "../axiosInstance";
import publicAxios from "../publicAxios";

const MEDIA_BASE = "/media";

const mediaService = {
  /* ------------------ PUBLIC ENDPOINTS ------------------ */

  async list(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/`, { params });
    return data;
  },

  async listBanners(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/banners/`, { params });
    return data;
  },

  async listFeatured(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/featured/`, { params });
    return data;
  },

  async listVendor(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/vendor/`, { params });
    return data;
  },

  async listPartner(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/partner/`, { params });
    return data;
  },

  async listUser(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/user/`, { params });
    return data;
  },

  async listHome(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/home/`, { params });
    return data;
  },

  async listAbout(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/about/`, { params });
    return data;
  },

  async listDecor(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/decor/`, { params });
    return data;
  },

  async listLiveBand(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/live-band/`, { params });
    return data;
  },

  async listCatering(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/catering/`, { params });
    return data;
  },

  async listMediaHosting(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/media-hosting/`, { params });
    return data;
  },

  async listPartnerVendorDashboard(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/partner-vendor-dashboard/`, { params });
    return data;
  },

  async stats() {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/stats/`);
    return data;
  },

  /* ------------------ ADMIN ENDPOINTS ------------------ */

  async upload(files, extra = {}) {
    const formData = new FormData();
    [...files].forEach((file) => formData.append("media", file));

    Object.entries(extra).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        val.forEach((v) => formData.append(key, v));
      } else {
        formData.append(key, val);
      }
    });

    const { data } = await axiosInstance.post(`${MEDIA_BASE}/upload/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async update(id, payload) {
    const { data } = await axiosInstance.patch(`${MEDIA_BASE}/${id}/update/`, payload);
    return data;
  },

  async toggleActive(id) {
    const { data } = await axiosInstance.patch(`${MEDIA_BASE}/${id}/toggle/`);
    return data;
  },

  async toggleFeatured(id) {
    const { data } = await axiosInstance.patch(`${MEDIA_BASE}/${id}/toggle/featured/`);
    return data;
  },

  async softDelete(id) {
    const { data } = await axiosInstance.delete(`${MEDIA_BASE}/${id}/delete/`);
    return data;
  },

  async restore(id) {
    const { data } = await axiosInstance.post(`${MEDIA_BASE}/${id}/restore/`);
    return data;
  },

  async listAll(params = {}) {
    const { data } = await axiosInstance.get(`${MEDIA_BASE}/all/`, { params });
    return data;
  },

  async listArchived(params = {}) {
    const { data } = await axiosInstance.get(`${MEDIA_BASE}/archived/`, { params });
    return data;
  },

  async reorder(orderArray) {
    const { data } = await axiosInstance.post(`${MEDIA_BASE}/reorder/`, orderArray);
    return data;
  },

  async debugProto() {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/debug/proto/`);
    return data;
  },
};

export default mediaService;
