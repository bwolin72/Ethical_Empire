import baseURL from './baseURL';

const videosAPI = {
  list: `${baseURL}/videos/videos/`,
  detail: (id) => `${baseURL}/videos/videos/${id}/`,
  toggleActive: (id) => `${baseURL}/videos/videos/${id}/toggle_active/`,
  toggleFeatured: (id) => `${baseURL}/videos/videos/${id}/toggle_featured/`,
};

export default videosAPI;
