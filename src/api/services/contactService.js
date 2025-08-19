// src/api/services/contactService.js
import publicAxios from '../publicAxios';
import API from '../api'; // endpoint constants aggregator (../api -> src/api/api.js)

const contactService = {
  /**
   * Send contact/enquiry message.
   * Uses publicAxios because contact form is typically anonymous.
   * Accepts optional axios config as second argument (e.g. { signal }).
   */
  send: (data, config) => publicAxios.post(API.contact.send, data, config),
};

export default contactService;
