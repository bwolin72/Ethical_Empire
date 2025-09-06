import baseURL from './baseURL';

// API endpoints for services
const servicesAPI = {
  list: `${baseURL}/services/`,                     // GET (list)
  detail: (slug) => `${baseURL}/services/${slug}/`, // GET (retrieve)
  create: `${baseURL}/services/`,                   // POST
  update: (slug) => `${baseURL}/services/${slug}/`, // PATCH
  delete: (slug) => `${baseURL}/services/${slug}/`, // DELETE
};

// Export under 'services' to match serviceService usage
export default { services: servicesAPI };
