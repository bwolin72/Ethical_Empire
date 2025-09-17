// D:\New folder\ethical_empire\frontend\src\api\services\messagingService.js
import messagingAPI from '../messagingAPI';

const messagingService = {
  async fetchMessages(filters = {}) {
    const res = await messagingAPI.listMessages(filters);
    return res.data;
  },

  async fetchUnread(filters = {}) {
    const res = await messagingAPI.listUnread(filters);
    return res.data;
  },

  async fetchMessage(id) {
    const res = await messagingAPI.getMessage(id);
    return res.data;
  },

  async sendMessage(formData) {
    // formData should be a FormData instance (for file upload)
    const res = await messagingAPI.createMessage(formData);
    return res.data;
  },

  async updateMessage(id, payload) {
    const res = await messagingAPI.updateMessage(id, payload);
    return res.data;
  },

  async removeMessage(id) {
    await messagingAPI.deleteMessage(id);
  },

  async markAsRead(id) {
    const res = await messagingAPI.markRead(id);
    return res.data;
  },

  async markAsUnread(id) {
    const res = await messagingAPI.markUnread(id);
    return res.data;
  }
};

export default messagingService;
