// D:\New folder\ethical_empire\frontend\src\api\services\messagingService.js
import messagingAPI from '../messagingAPI';

const messagingService = {
  // List all messages (optionally filtered)
  async fetchMessages(filters = {}) {
    const res = await messagingAPI.listMessages(filters);
    return res.data;
  },

  // List unread messages
  async fetchUnread(filters = {}) {
    const res = await messagingAPI.listUnread(filters);
    return res.data;
  },

  // Retrieve a single message by ID
  async fetchMessage(id) {
    const res = await messagingAPI.getMessage(id);
    return res.data;
  },

  // Send a new message (FormData supports attachment)
  async sendMessage(formData) {
    const res = await messagingAPI.createMessage(formData);
    return res.data;
  },

  // Update an existing message
  async updateMessage(id, payload) {
    const res = await messagingAPI.updateMessage(id, payload);
    return res.data;
  },

  // Delete a message
  async removeMessage(id) {
    await messagingAPI.deleteMessage(id);
  },

  // Mark a message as read
  async markAsRead(id) {
    const res = await messagingAPI.markRead(id);
    return res.data;
  },

  // Mark a message as unread
  async markAsUnread(id) {
    const res = await messagingAPI.markUnread(id);
    return res.data;
  }
};

export default messagingService;
