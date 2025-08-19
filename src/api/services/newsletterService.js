import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import API from '../api';

const newsletterService = {
  subscribe: (data) => publicAxios.post(API.newsletter.subscribe, data),
  confirmSubscription: (uid, token) =>
    publicAxios.get(API.newsletter.confirm(uid, token)),
  unsubscribe: (uid, token) => publicAxios.get(API.newsletter.unsubscribe(uid, token)),

  listSubscribers: () => axiosInstance.get(API.newsletter.adminList),
  deleteSubscriber: (id) => axiosInstance.delete(API.newsletter.delete(id)),
};

export default newsletterService;
