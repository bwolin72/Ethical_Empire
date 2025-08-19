import baseURL from './baseURL';

const servicesAPI = {
  list: `${baseURL}/services/`,
  detail: (slug) => `${baseURL}/services/${slug}/`,
};

export default servicesAPI;
