/**
 * Newsletter Service – provides a slightly higher-level abstraction
 * over raw API calls.  Good place to add client-side validation,
 * error handling, or transform responses before passing to components.
 */
import newsletterAPI from "../newsletterAPI";

export const newsletterService = {
  // === Public ===
  async subscribe(email, name, token) {
    const { data } = await newsletterAPI.subscribe({ email, name, token });
    return data; // { message: ... }
  },

  async confirmSubscription(token) {
    const { data } = await newsletterAPI.confirmSubscription(token);
    return data; // { message: ... }
  },

  async unsubscribe(email) {
    const { data } = await newsletterAPI.unsubscribe(email);
    return data; // { message: ... }
  },

  async resubscribe(email) {
    const { data } = await newsletterAPI.resubscribe(email);
    return data; // { message: ... }
  },

  async resendConfirmation(email) {
    const { data } = await newsletterAPI.resendConfirmation(email);
    return data; // { message: ... }
  },

  // === Admin ===
  async getSubscribers() {
    const { data } = await newsletterAPI.fetchSubscribers();
    return data; // [ {id, email, name, ...}, ... ]
  },

  async getSubscriberCount() {
    const { data } = await newsletterAPI.fetchSubscriberCount();
    return data.count; // integer
  },

  async getNewsletterLogs() {
    const { data } = await newsletterAPI.fetchNewsletterLogs();
    return data; // [ {id, subject, html, sent_at, ...}, ... ]
  },

  async sendNewsletter(subject, html, test = false) {
    const { data } = await newsletterAPI.sendNewsletter({ subject, html, test });
    return data; // { message: ..., log_id? }
  },

  async deleteSubscriber(id) {
    const { data } = await newsletterAPI.deleteSubscriber(id);
    return data; // { message: ... }
  },
};

export default newsletterService;
