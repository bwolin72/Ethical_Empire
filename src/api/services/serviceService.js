import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import API from '../api';

const serviceService = {
  getServices: () => publicAxios.get(API.services.list),
  getServiceDetail: (slug) => publicAxios.get(API.services.detail(slug)),
  createService: (data) => axiosInstance.post(API.services.create, data),
  updateService: (slug, data) => axiosInstance.patch(API.services.update(slug), data),
  deleteService: (slug) => axiosInstance.delete(API.services.delete(slug)),
};

export default serviceService;
