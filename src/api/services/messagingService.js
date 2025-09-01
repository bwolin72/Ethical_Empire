import axiosInstance from '../axiosInstance';
import API from '../messagingAPI';

const messagingService = {
  getMessages: () => axiosInstance.get(API.messaging.list),
  getMessageDetail: (id) => axiosInstance.get(API.messaging.detail(id)),
  sendMessage: (data) => axiosInstance.post(API.messaging.list, data),
  updateMessage: (id, data) => axiosInstance.patch(API.messaging.detail(id), data),
  deleteMessage: (id) => axiosInstance.delete(API.messaging.detail(id)),
  markMessageRead: (id) => axiosInstance.patch(API.messaging.detail(id), { is_read: true }),
};

export default messagingService;
