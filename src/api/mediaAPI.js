// src/api/mediaAPI.js
const BASE = "/api/media/"; // matches Django backend prefix

const mediaAPI = {
  // General
  list: (params) => ({ url: BASE, method: "get", params }),
  defaultList: (params) => ({ url: BASE, method: "get", params }),

  // Endpoint-specific
  banners: (params) => ({ url: `${BASE}banners/`, method: "get", params }),
  featured: (params) => ({ url: `${BASE}featured/`, method: "get", params }),
  home: (params) => ({ url: `${BASE}EethmHome/`, method: "get", params }),
  about: (params) => ({ url: `${BASE}about/`, method: "get", params }),
  decor: (params) => ({ url: `${BASE}DecorPage/`, method: "get", params }),
  liveBand: (params) => ({ url: `${BASE}LiveBandServicePage/`, method: "get", params }),
  catering: (params) => ({ url: `${BASE}CateringPage/`, method: "get", params }),
  mediaHosting: (params) => ({ url: `${BASE}MediaHostingServicePage/`, method: "get", params }),
  vendor: (params) => ({ url: `${BASE}VendorPage/`, method: "get", params }),
  partner: (params) => ({ url: `${BASE}PartnerPage/`, method: "get", params }),
  partnerDashboard: (params) => ({ url: `${BASE}PartnerDashboard/`, method: "get", params }),
  partnerVendorDashboard: (params) => ({ url: `${BASE}PartnerVendorDashboard/`, method: "get", params }),
  user: (params) => ({ url: `${BASE}UserPage/`, method: "get", params }),

  // Admin / actions
  upload: (data) => ({ url: `${BASE}upload/`, method: "post", data }),
  update: (id, data) => ({ url: `${BASE}${id}/update/`, method: "patch", data }),
  toggleActive: (id) => ({ url: `${BASE}${id}/toggle-active/`, method: "patch" }),
  toggleFeatured: (id) => ({ url: `${BASE}${id}/toggle-featured/`, method: "patch" }),
  delete: (id) => ({ url: `${BASE}${id}/delete/`, method: "delete" }),
  restore: (id) => ({ url: `${BASE}${id}/restore/`, method: "post" }),
  reorder: (data) => ({ url: `${BASE}reorder/`, method: "post", data }),
  stats: () => ({ url: `${BASE}stats/`, method: "get" }),
  archived: (params) => ({ url: `${BASE}archived/`, method: "get", params }),
};

export default mediaAPI;
