import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import API from '../api';

const contactService = {
  sendContactForm: (data) => publicAxios.post(API.contact.send, data),
  listContacts: () => axiosInstance.get(API.contact.list),
  getContactDetail: (id) => axiosInstance.get(API.contact.detail(id)),
  deleteContact: (id) => axiosInstance.delete(API.contact.delete(id)),
};

export default contactService;
