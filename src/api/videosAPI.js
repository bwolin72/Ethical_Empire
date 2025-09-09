// src/api/videosAPI.js
const BASE = "/api/videos/"; // matches Django backend prefix

const videosAPI = {
  list: (params) => ({ url: BASE, method: "get", params }),
  defaultList: (params) => ({ url: BASE, method: "get", params }),

  // Endpoint-specific
  home: (params) => ({ url: `${BASE}home/`, method: "get", params }),
  about: (params) => ({ url: `${BASE}about/`, method: "get", params }),
  decor: (params) => ({ url: `${BASE}decor/`, method: "get", params }),
  liveBand: (params) => ({ url: `${BASE}live_band/`, method: "get", params }),
  catering: (params) => ({ url: `${BASE}catering/`, method: "get", params }),
  mediaHosting: (params) => ({ url: `${BASE}media_hosting/`, method: "get", params }),
  user: (params) => ({ url: `${BASE}user/`, method: "get", params }),
  vendor: (params) => ({ url: `${BASE}vendor/`, method: "get", params }),
  partner: (params) => ({ url: `${BASE}partner/`, method: "get", params }),
  partnerDashboard: (params) => ({ url: `${BASE}partner_dashboard/`, method: "get", params }),
  agencyDashboard: (params) => ({ url: `${BASE}agency_dashboard/`, method: "get", params }),

  // Admin / actions
  create: (data) => ({ url: `${BASE}create/`, method: "post", data }),
  update: (id, data) => ({ url: `${BASE}${id}/update/`, method: "patch", data }),
  toggleActive: (id) => ({ url: `${BASE}${id}/toggle_active/`, method: "post" }),
  toggleFeatured: (id) => ({ url: `${BASE}${id}/toggle_featured/`, method: "post" }),
  delete: (id) => ({ url: `${BASE}${id}/delete/`, method: "delete" }),
  detail: (id) => ({ url: `${BASE}${id}/`, method: "get" }),
};

export default videosAPI;
