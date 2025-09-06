import baseURL from './baseURL';

const messagingAPI = {
  list: `${baseURL}/messaging/messages/`,
  detail: (id) => `${baseURL}/messaging/messages/${id}/`,
  create: `${baseURL}/messaging/messages/`,
  sendMessageToUsers: `${baseURL}/accounts/profiles/send-message/`,
  specialOffer: `${baseURL}/accounts/profiles/special-offer/`,
  // NOTE: removed mark-read/mark-unread/unread since not in backend
};

export default messagingAPI;
