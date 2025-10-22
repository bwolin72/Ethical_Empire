// src/api/services/mediaService.js
import mediaAPI from "../mediaAPI";

const mediaService = {
  /* ---------------------- PUBLIC ---------------------- */

  async list(params = {}) {
    try {
      const { data } = await mediaAPI.list(params);
      return data;
    } catch (error) {
      console.error("Error fetching media:", error);
      throw error.response?.data || { message: "Failed to fetch media." };
    }
  },

  async featured(params = {}) {
    try {
      const { data } = await mediaAPI.featured(params);
      return data;
    } catch (error) {
      console.error("Error fetching featured media:", error);
      throw error.response?.data || { message: "Failed to fetch featured media." };
    }
  },

  async banners(params = {}) {
    try {
      const { data } = await mediaAPI.banners(params);
      return data;
    } catch (error) {
      console.error("Error fetching banners:", error);
      throw error.response?.data || { message: "Failed to fetch banners." };
    }
  },

  async home(params = {}) {
    try {
      const { data } = await mediaAPI.home(params);
      return data;
    } catch (error) {
      console.error("Error fetching home media:", error);
      throw error.response?.data || { message: "Failed to fetch home media." };
    }
  },

  async about(params = {}) {
    try {
      const { data } = await mediaAPI.about(params);
      return data;
    } catch (error) {
      console.error("Error fetching about media:", error);
      throw error.response?.data || { message: "Failed to fetch about media." };
    }
  },

  /* ---------------------- ADMIN ---------------------- */

  async upload(files, extra = {}, onUploadProgress) {
    try {
      const { data } = await mediaAPI.upload(files, extra, onUploadProgress);
      return data;
    } catch (error) {
      console.error("Error uploading media:", error);
      throw error.response?.data || { message: "Media upload failed." };
    }
  },

  async update(id, payload) {
    try {
      const { data } = await mediaAPI.update(id, payload);
      return data;
    } catch (error) {
      console.error(`Error updating media ${id}:`, error);
      throw error.response?.data || { message: "Failed to update media." };
    }
  },

  async toggleActive(id) {
    try {
      const { data } = await mediaAPI.toggleActive(id);
      return data;
    } catch (error) {
      console.error(`Error toggling active state for ${id}:`, error);
      throw error.response?.data || { message: "Failed to toggle active." };
    }
  },

  async toggleFeatured(id) {
    try {
      const { data } = await mediaAPI.toggleFeatured(id);
      return data;
    } catch (error) {
      console.error(`Error toggling featured for ${id}:`, error);
      throw error.response?.data || { message: "Failed to toggle featured." };
    }
  },

  async delete(id) {
    try {
      const { data } = await mediaAPI.delete(id);
      return data;
    } catch (error) {
      console.error(`Error deleting media ${id}:`, error);
      throw error.response?.data || { message: "Failed to delete media." };
    }
  },

  async restore(id) {
    try {
      const { data } = await mediaAPI.restore(id);
      return data;
    } catch (error) {
      console.error(`Error restoring media ${id}:`, error);
      throw error.response?.data || { message: "Failed to restore media." };
    }
  },

  async reorder(orderArray) {
    try {
      const { data } = await mediaAPI.reorder(orderArray);
      return data;
    } catch (error) {
      console.error("Error reordering media:", error);
      throw error.response?.data || { message: "Failed to reorder media." };
    }
  },

  async stats() {
    try {
      const { data } = await mediaAPI.stats();
      return data;
    } catch (error) {
      console.error("Error fetching media stats:", error);
      throw error.response?.data || { message: "Failed to fetch stats." };
    }
  },

  async archived(params = {}) {
    try {
      const { data } = await mediaAPI.archived(params);
      return data;
    } catch (error) {
      console.error("Error fetching archived media:", error);
      throw error.response?.data || { message: "Failed to fetch archived media." };
    }
  },

  async all(params = {}) {
    try {
      const { data } = await mediaAPI.all(params);
      return data;
    } catch (error) {
      console.error("Error fetching all media:", error);
      throw error.response?.data || { message: "Failed to fetch all media." };
    }
  },
};

export default mediaService;
