// src/api/videosAPI.js
import baseURL from './axiosCommon';

const base = `${baseURL}/videos`;

const videosAPI = {
  // CRUD
  list: `${base}/`,                       // GET (list), POST (create)
  detail: (id) => `${base}/${id}/`,       // GET, PATCH, DELETE

  // Toggle actions
  toggleActive: (id) => `${base}/${id}/toggle_active/`,
  toggleFeatured: (id) => `${base}/${id}/toggle_featured/`,

  // Endpoint-specific actions
  home: `${base}/home/`,
  about: `${base}/about/`,
  decor: `${base}/decor/`,
  liveBand: `${base}/live_band/`,
  catering: `${base}/catering/`,
  mediaHosting: `${base}/media_hosting/`,
  vendor: `${base}/vendor/`,
  partner: `${base}/partner/`,
  user: `${base}/user/`,
  partnerVendorDashboard: `${base}/partner_vendor_dashboard/`,

  // Query by endpoint (?endpoint=...)
  byEndpoint: (endpoint, params = {}) => {
    const qs = new URLSearchParams({ endpoint, ...params }).toString();
    return `${base}/?${qs}`;
  },
};

export default videosAPI;
