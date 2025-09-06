import publicAxios from "./publicAxios";
import baseURL from "./baseURL";

const videosAPI = {
  list: (params) => publicAxios.get(`${baseURL}/videos/videos/`, { params }),
  home: (params) => publicAxios.get(`${baseURL}/videos/videos/home/`, { params }),
  about: (params) => publicAxios.get(`${baseURL}/videos/videos/about/`, { params }),
  decor: (params) => publicAxios.get(`${baseURL}/videos/videos/decor/`, { params }),
  liveBand: (params) => publicAxios.get(`${baseURL}/videos/videos/live_band/`, { params }),
  catering: (params) => publicAxios.get(`${baseURL}/videos/videos/catering/`, { params }),
  mediaHosting: (params) => publicAxios.get(`${baseURL}/videos/videos/media_hosting/`, { params }),
  vendor: (params) => publicAxios.get(`${baseURL}/videos/videos/vendor/`, { params }),
  partner: (params) => publicAxios.get(`${baseURL}/videos/videos/partner/`, { params }),
  user: (params) => publicAxios.get(`${baseURL}/videos/videos/user/`, { params }),
  partnerVendorDashboard: (params) => publicAxios.get(`${baseURL}/videos/videos/partner_vendor_dashboard/`, { params }),

  // Admin-only
  upload: (data) => publicAxios.post(`${baseURL}/videos/videos/`, data),
  update: (id, data) => publicAxios.patch(`${baseURL}/videos/videos/${id}/`, data),
  delete: (id) => publicAxios.delete(`${baseURL}/videos/videos/${id}/`),
  toggle: (id) => publicAxios.post(`${baseURL}/videos/videos/${id}/toggle_active/`),
  toggleFeatured: (id) => publicAxios.post(`${baseURL}/videos/videos/${id}/toggle_featured/`),
};

export default videosAPI;
