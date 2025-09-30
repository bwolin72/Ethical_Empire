// src/api/services/messagingService.js
import messagingAPI from "../messagingAPI";

const messagingService = {
  /**
   * 📩 Fetch all messages
   * Handles both paginated (DRF default) and non-paginated responses safely.
   * Optionally accepts filters.
   */
  async fetchMessages(filters = {}) {
    try {
      const res = await messagingAPI.listMessages(filters);

      // ✅ Handle DRF pagination: return array (data.results) or full data
      const data = res?.data || [];
      return Array.isArray(data) ? data : data?.results || [];
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  },

  /**
   * 📥 Fetch only unread messages
   */
  async fetchUnread(filters = {}) {
    try {
      const res = await messagingAPI.listUnread(filters);
      const data = res?.data || [];
      return Array.isArray(data) ? data : data?.results || [];
    } catch (error) {
      console.error("Error fetching unread messages:", error);
      throw error;
    }
  },

  /**
   * 🔍 Retrieve a single message by ID
   */
  async fetchMessage(id) {
    try {
      const res = await messagingAPI.getMessage(id);
      return res?.data;
    } catch (error) {
      console.error(`Error fetching message ${id}:`, error);
      throw error;
    }
  },

  /**
   * ✉️ Send a new message (supports attachments)
   */
  async sendMessage(formData) {
    try {
      const res = await messagingAPI.createMessage(formData);
      return res?.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  /**
   * 🛠️ Update an existing message
   */
  async updateMessage(id, payload) {
    try {
      const res = await messagingAPI.updateMessage(id, payload);
      return res?.data;
    } catch (error) {
      console.error(`Error updating message ${id}:`, error);
      throw error;
    }
  },

  /**
   * 🗑️ Delete a message
   */
  async removeMessage(id) {
    try {
      await messagingAPI.deleteMessage(id);
      return true;
    } catch (error) {
      console.error(`Error deleting message ${id}:`, error);
      throw error;
    }
  },

  /**
   * ✅ Mark message as read
   */
  async markAsRead(id) {
    try {
      const res = await messagingAPI.markRead(id);
      return res?.data;
    } catch (error) {
      console.error(`Error marking message ${id} as read:`, error);
      throw error;
    }
  },

  /**
   * ❌ Mark message as unread
   */
  async markAsUnread(id) {
    try {
      const res = await messagingAPI.markUnread(id);
      return res?.data;
    } catch (error) {
      console.error(`Error marking message ${id} as unread:`, error);
      throw error;
    }
  },
};

export default messagingService;
