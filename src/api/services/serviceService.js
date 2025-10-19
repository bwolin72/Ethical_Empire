import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import API from '../servicesAPI';

const { services } = API;

/**
 * Frontend service layer for interacting with the Services API
 * Handles both public and authenticated (admin) requests.
 */
const serviceService = {
  // ---------------- Public endpoints ----------------

  // Get all active services
  getServices: () => publicAxios.get(services.list),

  // Get detailed information about a service by slug
  getServiceDetail: (slug) => publicAxios.get(services.detail(slug)),

  // Filter services by category name or slug
  getServicesByCategory: (name) =>
    publicAxios.get(services.filterByCategory(name)),
  getServicesByCategorySlug: (slug) =>
    publicAxios.get(services.filterByCategorySlug(slug)),

  // Category endpoints
  getCategories: () => publicAxios.get(services.categories),
  getCategoryDetail: (slug) => publicAxios.get(services.categoryDetail(slug)),
  getCategoryServices: (slug) => publicAxios.get(services.categoryServices(slug)),

  // Get categories with nested active services (ServiceViewSet.categories)
  getNestedCategories: () => publicAxios.get(services.nestedCategories),

  // ---------------- Admin endpoints (authenticated) ----------------

  // Create a new service (admin only)
  createService: (data) => axiosInstance.post(services.create, data),

  // Update an existing service by slug (admin only)
  updateService: (slug, data) => axiosInstance.patch(services.update(slug), data),

  // Delete a service by slug (admin only)
  deleteService: (slug) => axiosInstance.delete(services.delete(slug)),
};

export default serviceService;
