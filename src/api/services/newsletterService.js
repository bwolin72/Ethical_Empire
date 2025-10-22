// src/services/newsletterService.js
import newsletterAPI from "../newsletterAPI";

export const newsletterService = {
  // === Public ===
  async subscribe(email, name, token) {
    try {
      const { data } = await newsletterAPI.subscribe({ email, name, token });
      return data; // { message: ... }
    } catch (error) {
      console.error("Newsletter subscribe error:", error);
      throw error.response?.data || { message: "Subscription failed." };
    }
  },

  async confirmSubscription(token) {
    try {
      const { data } = await newsletterAPI.confirmSubscription(token);
      return data; // { message: ... }
    } catch (error) {
      console.error("Confirm subscription error:", error);
      throw error.response?.data || { message: "Confirmation failed." };
    }
  },

  async unsubscribe(email) {
    try {
      const { data } = await newsletterAPI.unsubscribe(email);
      return data; // { message: ... }
    } catch (error) {
      console.error("Unsubscribe error:", error);
      throw error.response?.data || { message: "Unsubscription failed." };
    }
  },

  async resubscribe(email) {
    try {
      const { data } = await newsletterAPI.resubscribe(email);
      return data; // { message: ... }
    } catch (error) {
      console.error("Resubscribe error:", error);
      throw error.response?.data || { message: "Resubscription failed." };
    }
  },

  async resendConfirmation(email) {
    try {
      const { data } = await newsletterAPI.resendConfirmation(email);
      return data; // { message: ... }
    } catch (error) {
      console.error("Resend confirmation error:", error);
      throw error.response?.data || { message: "Resend failed." };
    }
  },

  // === Admin ===
  async getSubscribers() {
    try {
      const { data } = await newsletterAPI.fetchSubscribers();
      return data; // [ {id, email, name, ...}, ... ]
    } catch (error) {
      console.error("Fetch subscribers error:", error);
      throw error.response?.data || { message: "Failed to load subscribers." };
    }
  },

  async getSubscriberCount() {
    try {
      const { data } = await newsletterAPI.fetchSubscriberCount();
      return data.count; // integer
    } catch (error) {
      console.error("Fetch subscriber count error:", error);
      throw error.response?.data || { message: "Failed to get count." };
    }
  },

  async getNewsletterLogs() {
    try {
      const { data } = await newsletterAPI.fetchNewsletterLogs();
      return data; // [ {id, subject, html, sent_at, ...}, ... ]
    } catch (error) {
      console.error("Fetch newsletter logs error:", error);
      throw error.response?.data || { message: "Failed to load logs." };
    }
  },

  async sendNewsletter(subject, html, test = false) {
    try {
      const { data } = await newsletterAPI.sendNewsletter({ subject, html, test });
      return data; // { message: ..., log_id? }
    } catch (error) {
      console.error("Send newsletter error:", error);
      throw error.response?.data || { message: "Failed to send newsletter." };
    }
  },

  async deleteSubscriber(id) {
    try {
      const { data } = await newsletterAPI.deleteSubscriber(id);
      return data; // { message: ... }
    } catch (error) {
      console.error("Delete subscriber error:", error);
      throw error.response?.data || { message: "Failed to delete subscriber." };
    }
  },
};

export default newsletterService;
