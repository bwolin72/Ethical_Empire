// src/api/mediaAPI.js
import axiosInstance from "./axiosInstance";

const mediaAPI = {
  // Fetch all media with optional query params
  all: async (params = {}) => {
    return await axiosInstance.get("/media/", { params });
  },

  // Fetch banners
  banners: async () => {
    return await axiosInstance.get("/media/banners/");
  },

  // Fetch featured media
  featured: async () => {
    return await axiosInstance.get("/media/featured/");
  },

  // Upload multiple files
  upload: async (files, { type = "media", label = "", endpoint = [], onUploadProgress }) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("type", type);
    formData.append("label", label);
    endpoint.forEach((ep) => formData.append("endpoint", ep));

    return await axiosInstance.post("/media/upload/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
    });
  },

  // Toggle active / inactive
  toggle: async (id) => {
    return await axiosInstance.post(`/media/${id}/toggle/`);
  },

  // Toggle featured
  toggleFeatured: async (id) => {
    return await axiosInstance.post(`/media/${id}/toggle-featured/`);
  },

  // Soft delete media
  delete: async (id) => {
    return await axiosInstance.delete(`/media/${id}/`);
  },

  // Restore deleted media
  restore: async (id) => {
    return await axiosInstance.post(`/media/${id}/restore/`);
  },

  // Reorder media items
  reorder: async (items) => {
    // items = [{ id: media_id, position: index }, ...]
    return await axiosInstance.post("/media/reorder/", { items });
  },
};

export default mediaAPI;
