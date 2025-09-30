// src/api/mediaAPI.js
import axiosInstance from "./axiosInstance";

const mediaAPI = {
  // Fetch all media with optional query params
  all: async (params = {}) => {
    return await axiosInstance.get("/media/", { params });
  },

  // Fetch banners
  banners: async (params = {}) => {
    return await axiosInstance.get("/media/banners/", { params });
  },

  // Fetch featured media
  featured: async (params = {}) => {
    return await axiosInstance.get("/media/featured/", { params });
  },

  // Upload multiple files
  upload: async (files, { type = "media", label = "", endpoint = [], onUploadProgress }) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("media", file)); // ✅ key must be "media"
    formData.append("type", type);
    formData.append("label", label);
    endpoint.forEach((ep) => formData.append("endpoint", ep));

    return await axiosInstance.post("/media/upload/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true, // if session auth
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
    });
  },

  // Toggle active / inactive (PATCH, admin required)
  toggle: async (id) => {
    return await axiosInstance.patch(`/media/${id}/toggle/`, {}, { withCredentials: true });
  },

  // Toggle featured (PATCH, admin required)
  toggleFeatured: async (id) => {
    return await axiosInstance.patch(`/media/${id}/toggle-featured/`, {}, { withCredentials: true });
  },

  // Soft delete media
  delete: async (id) => {
    return await axiosInstance.delete(`/media/${id}/`, { withCredentials: true });
  },

  // Restore deleted media
  restore: async (id) => {
    return await axiosInstance.post(`/media/${id}/restore/`, {}, { withCredentials: true });
  },

  // Reorder media items
  reorder: async (items) => {
    // items = [{ id: media_id, position: index }, ...]
    return await axiosInstance.post("/media/reorder/", items, { withCredentials: true });
  },
};

export default mediaAPI;
