// D:\New folder\ethical_empire\frontend\src\api\messagingAPI.js
import axiosInstance from './axiosInstance';

const messagingAPI = {
  listMessages: (params) =>
    axiosInstance.get('/messages/', { params }),

  getMessage: (id) =>
    axiosInstance.get(`/messages/${id}/`),

  createMessage: (data) =>
    axiosInstance.post('/messages/', data, {
      headers: { 'Content-Type': 'multipart/form-data' } // allow file upload
    }),

  updateMessage: (id, data) =>
    axiosInstance.patch(`/messages/${id}/`, data),

  deleteMessage: (id) =>
    axiosInstance.delete(`/messages/${id}/`),

  markRead: (id) =>
    axiosInstance.patch(`/messages/${id}/mark-read/`),

  markUnread: (id) =>
    axiosInstance.patch(`/messages/${id}/mark-unread/`),

  listUnread: (params) =>
    axiosInstance.get('/messages/unread/', { params }),
};

export default messagingAPI;
