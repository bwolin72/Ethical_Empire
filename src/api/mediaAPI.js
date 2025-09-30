// src/api/mediaAPI.js
import axios from "axios";

// Get token from localStorage or set manually after login
const TOKEN = localStorage.getItem("authToken") || "<YOUR_TOKEN>";

const api = axios.create({
  baseURL: "https://api.eethmghmultimedia.com/api/media/",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`, // send token for authenticated endpoints
  },
  withCredentials: true, // optional, if session cookies are also used
});

const mediaAPI = {
  // Public
  list: (params) => api.get("", { params }),
  banners: () => api.get("banners/"),
  featured: () => api.get("featured/"),
  vendor: () => api.get("", { params: { endpoint: "VendorPage" } }),
  partner: () => api.get("", { params: { endpoint: "PartnerPage" } }),
  user: () => api.get("", { params: { endpoint: "UserPage" } }),
  home: () => api.get("", { params: { endpoint: "EethmHome" } }),
  about: () => api.get("", { params: { endpoint: "About" } }),
  decor: () => api.get("", { params: { endpoint: "DecorPage" } }),
  liveBand: () => api.get("", { params: { endpoint: "LiveBandServicePage" } }),
  catering: () => api.get("", { params: { endpoint: "CateringPage" } }),
  mediaHosting: () => api.get("", { params: { endpoint: "MediaHostingServicePage" } }),
  partnerVendorDashboard: () => api.get("", { params: { endpoint: "PartnerVendorDashboard" } }),
  stats: () => api.get("stats/"),

  // Admin
  upload: (files, extra) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    Object.entries(extra).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => formData.append(`${key}[]`, v));
      } else formData.append(key, value);
    });

    return api.post("upload/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (extra.onUploadProgress)
          extra.onUploadProgress(Math.round((event.loaded * 100) / event.total));
      },
    });
  },
  update: (id, payload) => api.put(`${id}/update/`, payload),
  toggle: (id) => api.post(`${id}/toggle/`),
  toggleFeatured: (id) => api.post(`${id}/toggle/featured/`),
  delete: (id) => api.delete(`${id}/delete/`),
  restore: (id) => api.post(`${id}/restore/`),
  all: (params) => api.get("all/", { params }),
  archived: (params) => api.get("archived/", { params }),
  reorder: (payload) => api.post("reorder/", payload),
};

export default mediaAPI;
