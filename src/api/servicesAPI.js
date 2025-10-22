// src/api/servicesAPI.js
import baseURL from './baseURL';

const servicesAPI = {
  // ---------------- Services ----------------
  list: `${baseURL}/services/services/`,                          // GET all services
  detail: (slug) => `${baseURL}/services/services/${slug}/`,      // GET / PATCH / DELETE a single service
  create: `${baseURL}/services/services/`,                        // POST new service
  update: (slug) => `${baseURL}/services/services/${slug}/`,      // PATCH
  delete: (slug) => `${baseURL}/services/services/${slug}/`,      // DELETE

  // Filter services by category
  filterByCategory: (name) => `${baseURL}/services/services/?category=${name}`,
  filterByCategorySlug: (slug) => `${baseURL}/services/services/?category_slug=${slug}`,

  // ---------------- Categories ----------------
  categories: `${baseURL}/services/categories/`,                       // GET all categories
  categoryDetail: (slug) => `${baseURL}/services/categories/${slug}/`, // GET single category
  categoryServices: (slug) => `${baseURL}/services/categories/${slug}/services/`, // GET services in category

  // ---------------- Nested Service Categories ----------------
  nestedCategories: `${baseURL}/services/services/categories/`, // GET categories with nested services
};

export default { services: servicesAPI };
