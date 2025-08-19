import baseURL from './baseURL';

const servicesAPI = {
  list: `${baseURL}/services/`,                     // GET (list), POST (create)
  detail: (slug) => `${baseURL}/services/${slug}/`, // GET (retrieve)
  create: `${baseURL}/services/`,                   // POST
  update: (slug) => `${baseURL}/services/${slug}/`, // PATCH or PUT
  delete: (slug) => `${baseURL}/services/${slug}/`, // DELETE
};

export default servicesAPI;
