// D:\New folder\ethical_empire\frontend\src\api\messagingAPI.js
import axiosInstance from './axiosInstance';

// ✅ All routes now match Django DRF router: /api/messaging/messages/
const BASE_URL = '/messaging/messages/';

const messagingAPI = {
  // GET: List all messages (paginated or filtered)
  listMessages: (params) =>
    axiosInstance.get(BASE_URL, { params }),

  // GET: Retrieve a single message by ID
  getMessage: (id) =>
    axiosInstance.get(`${BASE_URL}${id}/`),

  // POST: Create a new message (with or without attachment)
  createMessage: (data) =>
    axiosInstance.post(BASE_URL, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // PATCH: Update an existing message
  updateMessage: (id, data) =>
    axiosInstance.patch(`${BASE_URL}${id}/`, data),

  // DELETE: Remove a message
  deleteMessage: (id) =>
    axiosInstance.delete(`${BASE_URL}${id}/`),

  // PATCH: Mark message as read
  markRead: (id) =>
    axiosInstance.patch(`${BASE_URL}${id}/mark-read/`),

  // PATCH: Mark message as unread
  markUnread: (id) =>
    axiosInstance.patch(`${BASE_URL}${id}/mark-unread/`),

  // GET: List all unread messages
  listUnread: (params) =>
    axiosInstance.get(`${BASE_URL}unread/`, { params }),
};

export default messagingAPI;
