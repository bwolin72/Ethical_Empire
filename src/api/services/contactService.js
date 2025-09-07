// src/api/services/contactService.js
import publicAxios from '../publicAxios';
import contactAPI from '../contactAPI'; // corrected import

const contactService = {
  /**
   * Send contact/enquiry message.
   * Uses publicAxios because contact form is typically anonymous.
   */
  send: (data, config = {}) => {
    return publicAxios.post(contactAPI.send, data, config);
  },
};

export default contactService;
