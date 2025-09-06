// src/api/contactAPI.js
import baseURL from './baseURL';

const contactAPI = {
  // backend exposes POST /api/contact/send/
  send: `${baseURL}/contact/send/`,
};

export default contactAPI;
