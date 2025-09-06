import publicAxios from "./publicAxios";
import baseURL from "./baseURL";

const videosAPI = {
  // Generic list
  list: (params) => publicAxios.get(`${baseURL}/videos/`, { params }),

  // Endpoint-specific
  home: (params) => publicAxios.get(`${baseURL}/videos/home/`, { params }),
  about: (params) => publicAxios.get(`${baseURL}/videos/about/`, { params }),
  decor: (params) => publicAxios.get(`${baseURL}/videos/decor/`, { params }),
  liveBand: (params) => publicAxios.get(`${baseURL}/videos/live_band/`, { params }),
  catering: (params) => publicAxios.get(`${baseURL}/videos/catering/`, { params }),
  mediaHosting: (params) => publicAxios.get(`${baseURL}/videos/media_hosting/`, { params }),
  vendor: (params) => publicAxios.get(`${baseURL}/videos/vendor/`, { params }),
  partner: (params) => publicAxios.get(`${baseURL}/videos/partner/`, { params }),
  user: (params) => publicAxios.get(`${baseURL}/videos/user/`, { params }),
  partnerDashboard: (params) => publicAxios.get(`${baseURL}/videos/partner_dashboard/`, { params }),
  agencyDashboard: (params) => publicAxios.get(`${baseURL}/videos/agency_dashboard/`, { params }),

  // Admin-only
  upload: (data) => publicAxios.post(`${baseURL}/videos/`, data),
  update: (id, data) => publicAxios.patch(`${baseURL}/videos/${id}/`, data),
  delete: (id) => publicAxios.delete(`${baseURL}/videos/${id}/`),
  toggle: (id) => publicAxios.post(`${baseURL}/videos/${id}/toggle_active/`),
  toggleFeatured: (id) => publicAxios.post(`${baseURL}/videos/${id}/toggle_featured/`),
};

export default videosAPI;
