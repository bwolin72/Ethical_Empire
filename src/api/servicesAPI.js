import baseURL from './baseURL';

/**
 * Full API paths for the Services module
 * Matches backend routes:
 *   /api/services/services/
 *   /api/services/categories/
 */
const servicesAPI = {
  // ----- Services -----
  list: `${baseURL}/services/services/`,                       // GET all services
  detail: (slug) => `${baseURL}/services/services/${slug}/`,   // GET a single service
  create: `${baseURL}/services/services/`,                     // POST (create)
  update: (slug) => `${baseURL}/services/services/${slug}/`,   // PATCH (update)
  delete: (slug) => `${baseURL}/services/services/${slug}/`,   // DELETE

  // ----- Category filtering -----
  filterByCategory: (name) => `${baseURL}/services/services/?category=${name}`,
  filterByCategorySlug: (slug) => `${baseURL}/services/services/?category_slug=${slug}`,

  // ----- Categories -----
  categories: `${baseURL}/services/categories/`,                      // GET all categories
  categoryDetail: (slug) => `${baseURL}/services/categories/${slug}/`, // GET single category
  categoryServices: (slug) => `${baseURL}/services/categories/${slug}/services/`, // GET services in category

  // ----- Nested route from ServiceViewSet.categories action -----
  nestedCategories: `${baseURL}/services/services/categories/`,        // GET categories with nested services
};

// Export under 'services' namespace
export default { services: servicesAPI };
