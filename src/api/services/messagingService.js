// src/api/services/messagingService.js
import messagingAPI from "../messagingAPI"; // Axios instance or similar

const messagingService = {
  // ---------------- Fetch all messages ----------------
  async fetchMessages() {
    try {
      const res = await messagingAPI.get("/messages/");
      // DRF may paginate
      const data = res?.data || [];
      return Array.isArray(data) ? data : data?.results || [];
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  },

  // ---------------- Fetch unread messages ----------------
  async fetchUnread() {
    try {
      const res = await messagingAPI.get("/messages/unread/");
      const data = res?.data || [];
      return Array.isArray(data) ? data : data?.results || [];
    } catch (error) {
      console.error("Error fetching unread messages:", error);
      throw error;
    }
  },

  // ---------------- Fetch single message ----------------
  async fetchMessage(id) {
    try {
      const res = await messagingAPI.get(`/messages/${id}/`);
      return res?.data;
    } catch (error) {
      console.error(`Error fetching message ${id}:`, error);
      throw error;
    }
  },

  // ---------------- Send / create message ----------------
  async sendMessage(formData) {
    try {
      const res = await messagingAPI.post("/messages/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res?.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  // ---------------- Update message ----------------
  async updateMessage(id, payload) {
    try {
      const res = await messagingAPI.put(`/messages/${id}/`, payload);
      return res?.data;
    } catch (error) {
      console.error(`Error updating message ${id}:`, error);
      throw error;
    }
  },

  async partialUpdateMessage(id, payload) {
    try {
      const res = await messagingAPI.patch(`/messages/${id}/`, payload);
      return res?.data;
    } catch (error) {
      console.error(`Error patching message ${id}:`, error);
      throw error;
    }
  },

  // ---------------- Delete message ----------------
  async removeMessage(id) {
    try {
      await messagingAPI.delete(`/messages/${id}/`);
      return true;
    } catch (error) {
      console.error(`Error deleting message ${id}:`, error);
      throw error;
    }
  },

  // ---------------- Mark as read ----------------
  async markAsRead(id) {
    try {
      const res = await messagingAPI.patch(`/messages/${id}/mark-read/`);
      return res?.data;
    } catch (error) {
      console.error(`Error marking message ${id} as read:`, error);
      throw error;
    }
  },

  // ---------------- Mark as unread ----------------
  async markAsUnread(id) {
    try {
      const res = await messagingAPI.patch(`/messages/${id}/mark-unread/`);
      return res?.data;
    } catch (error) {
      console.error(`Error marking message ${id} as unread:`, error);
      throw error;
    }
  },
};

export default messagingService;
