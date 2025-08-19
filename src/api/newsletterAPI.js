import baseURL from './baseURL';

const newsletterAPI = {
  subscribe: `${baseURL}/newsletter/subscribe/`,
  unsubscribe: `${baseURL}/newsletter/unsubscribe/`,
  send: `${baseURL}/newsletter/send/`,
  logs: `${baseURL}/newsletter/logs/`,
  confirm: `${baseURL}/newsletter/confirm/`, // token handled in request
  resendConfirmation: `${baseURL}/newsletter/resend-confirmation/`,
  resubscribe: `${baseURL}/newsletter/resubscribe/`,
  count: `${baseURL}/newsletter/count/`,
  list: `${baseURL}/newsletter/list/`,
  delete: (id) => `${baseURL}/newsletter/delete/${id}/`,
};

export default newsletterAPI;
