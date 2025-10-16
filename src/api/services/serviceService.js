import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import API from '../servicesAPI';

const { services } = API;

const serviceService = {
  // ---------------- Public endpoints ----------------
  getServices: () => publicAxios.get(services.list),
  getServiceDetail: (slug) => publicAxios.get(services.detail(slug)),

  // Filter services by category name or slug
  getServicesByCategory: (name) => publicAxios.get(services.filterByCategory(name)),
  getServicesByCategorySlug: (slug) => publicAxios.get(services.filterByCategorySlug(slug)),

  // Category endpoints
  getCategories: () => publicAxios.get(services.categories),
  getCategoryDetail: (slug) => publicAxios.get(services.categoryDetail(slug)),
  getCategoryServices: (slug) => publicAxios.get(services.categoryServices(slug)),

  // Get categories with nested services (ServiceViewSet.categories action)
  getNestedCategories: () => publicAxios.get(services.nestedCategories),

  // ---------------- Admin endpoints (authenticated) ----------------
  createService: (data) => axiosInstance.post(services.create, data),
  updateService: (slug, data) => axiosInstance.patch(services.update(slug), data),
  deleteService: (slug) => axiosInstance.delete(services.delete(slug)),
};

export default serviceService;
