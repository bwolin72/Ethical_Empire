import baseURL from "./baseURL";

const newsletterAPI = {
  // === Public / Subscriber ===
  subscribe: `${baseURL}/newsletter/subscribe/`,
  confirm: `${baseURL}/newsletter/confirm/`,
  unsubscribe: `${baseURL}/newsletter/unsubscribe/`,
  resubscribe: `${baseURL}/newsletter/resubscribe/`,
  resendConfirmation: `${baseURL}/newsletter/resend-confirmation/`,

  // === Admin Only ===
  list: `${baseURL}/newsletter/list/`,
  count: `${baseURL}/newsletter/count/`,
  logs: `${baseURL}/newsletter/logs/`,
  send: `${baseURL}/newsletter/send/`,
  delete: (id) => `${baseURL}/newsletter/delete/${id}/`,
};

export default newsletterAPI;
