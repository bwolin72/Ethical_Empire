// src/services/messagingService.js
import messagingAPI from "../messagingAPI";

const messagingService = {
  // ---------------- List all messages ----------------
  async fetchMessages(params = {}) {
    try {
      const { data } = await messagingAPI.listMessages(params);
      // Handle pagination support (DRF default)
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error.response?.data || { message: "Failed to fetch messages." };
    }
  },

  // ---------------- Fetch unread messages ----------------
  async fetchUnread(params = {}) {
    try {
      const { data } = await messagingAPI.listUnread(params);
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.error("Error fetching unread messages:", error);
      throw error.response?.data || { message: "Failed to fetch unread messages." };
    }
  },

  // ---------------- Fetch single message ----------------
  async fetchMessage(id) {
    try {
      const { data } = await messagingAPI.getMessage(id);
      return data;
    } catch (error) {
      console.error(`Error fetching message ${id}:`, error);
      throw error.response?.data || { message: "Failed to fetch message details." };
    }
  },

  // ---------------- Send / create message ----------------
  async sendMessage(formData) {
    try {
      const { data } = await messagingAPI.createMessage(formData);
      return data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error.response?.data || { message: "Failed to send message." };
    }
  },

  // ---------------- Update message ----------------
  async updateMessage(id, payload) {
    try {
      const { data } = await messagingAPI.updateMessage(id, payload);
      return data;
    } catch (error) {
      console.error(`Error updating message ${id}:`, error);
      throw error.response?.data || { message: "Failed to update message." };
    }
  },

  // ---------------- Delete message ----------------
  async removeMessage(id) {
    try {
      await messagingAPI.deleteMessage(id);
      return true;
    } catch (error) {
      console.error(`Error deleting message ${id}:`, error);
      throw error.response?.data || { message: "Failed to delete message." };
    }
  },

  // ---------------- Mark as read ----------------
  async markAsRead(id) {
    try {
      const { data } = await messagingAPI.markRead(id);
      return data;
    } catch (error) {
      console.error(`Error marking message ${id} as read:`, error);
      throw error.response?.data || { message: "Failed to mark as read." };
    }
  },

  // ---------------- Mark as unread ----------------
  async markAsUnread(id) {
    try {
      const { data } = await messagingAPI.markUnread(id);
      return data;
    } catch (error) {
      console.error(`Error marking message ${id} as unread:`, error);
      throw error.response?.data || { message: "Failed to mark as unread." };
    }
  },
};

export default messagingService;
