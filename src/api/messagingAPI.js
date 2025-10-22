// src/api/messagingAPI.js
import axiosInstance from "./axiosInstance";

// ✅ Matches Django DRF router: /api/messaging/messages/
const BASE_URL = "/messaging/messages/";

const messagingAPI = {
  // GET: List all messages (supports pagination or filters)
  listMessages(params) {
    return axiosInstance.get(BASE_URL, { params });
  },

  // GET: Retrieve single message
  getMessage(id) {
    return axiosInstance.get(`${BASE_URL}${id}/`);
  },

  // POST: Create new message (supports attachments)
  createMessage(data) {
    return axiosInstance.post(BASE_URL, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // PATCH: Update partial message
  updateMessage(id, data) {
    return axiosInstance.patch(`${BASE_URL}${id}/`, data);
  },

  // DELETE: Delete a message
  deleteMessage(id) {
    return axiosInstance.delete(`${BASE_URL}${id}/`);
  },

  // PATCH: Mark as read
  markRead(id) {
    return axiosInstance.patch(`${BASE_URL}${id}/mark-read/`);
  },

  // PATCH: Mark as unread
  markUnread(id) {
    return axiosInstance.patch(`${BASE_URL}${id}/mark-unread/`);
  },

  // GET: List unread messages
  listUnread(params) {
    return axiosInstance.get(`${BASE_URL}unread/`, { params });
  },
};

export default messagingAPI;
