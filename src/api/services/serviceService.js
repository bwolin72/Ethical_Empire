import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import API from '../servicesAPI';

const { services } = API;

const serviceService = {
  // ---------------- Public ----------------
  getServices: () => publicAxios.get(services.list),
  getServiceDetail: (slug) => publicAxios.get(services.detail(slug)),
  getServicesByCategory: (name) => publicAxios.get(services.filterByCategory(name)),
  getServicesByCategorySlug: (slug) => publicAxios.get(services.filterByCategorySlug(slug)),
  getCategories: () => publicAxios.get(services.categories),
  getCategoryDetail: (slug) => publicAxios.get(services.categoryDetail(slug)),
  getCategoryServices: (slug) => publicAxios.get(services.categoryServices(slug)),
  getNestedCategories: () => publicAxios.get(services.nestedCategories),

  // ---------------- Admin ----------------
  createService: (data) => axiosInstance.post(services.create, data),
  updateService: (slug, data) => axiosInstance.patch(services.update(slug), data),
  deleteService: (slug) => axiosInstance.delete(services.delete(slug)),
};

export default serviceService;
