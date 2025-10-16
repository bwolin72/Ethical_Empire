import baseURL from './baseURL';

const servicesAPI = {
  // ----- Services -----
  list: `${baseURL}/services/`,                       // GET all services
  detail: (slug) => `${baseURL}/services/${slug}/`,   // GET a single service
  create: `${baseURL}/services/`,                     // POST (create)
  update: (slug) => `${baseURL}/services/${slug}/`,   // PATCH (update)
  delete: (slug) => `${baseURL}/services/${slug}/`,   // DELETE

  // ----- Category filtering -----
  filterByCategory: (name) => `${baseURL}/services/?category=${name}`,
  filterByCategorySlug: (slug) => `${baseURL}/services/?category_slug=${slug}`,

  // ----- Categories -----
  categories: `${baseURL}/categories/`,                      // GET all categories
  categoryDetail: (slug) => `${baseURL}/categories/${slug}/`, // GET single category
  categoryServices: (slug) => `${baseURL}/categories/${slug}/services/`, // GET services in category

  // ----- Nested route from ServiceViewSet -----
  nestedCategories: `${baseURL}/services/categories/`,        // GET categories with nested services
};

// export under 'services' to match usage
export default { services: servicesAPI };
