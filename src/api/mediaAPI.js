import axiosInstance from "./axiosInstance";

const mediaAPI = {
  // ---- Public lists ----
  list: (params = {}) => axiosInstance.get("/media/", { params }),
  banners: (params = {}) => axiosInstance.get("/media/banners/", { params }),
  featured: (params = {}) => axiosInstance.get("/media/featured/", { params }),

  // ---- Endpoint-specific lists ----
  vendor: () => axiosInstance.get("/media/vendor/"),
  partner: () => axiosInstance.get("/media/partner/"),
  user: () => axiosInstance.get("/media/user/"),
  home: () => axiosInstance.get("/media/home/"),
  about: () => axiosInstance.get("/media/about/"),
  decor: () => axiosInstance.get("/media/decor/"),
  liveBand: () => axiosInstance.get("/media/live-band/"),
  catering: () => axiosInstance.get("/media/catering/"),
  mediaHosting: () => axiosInstance.get("/media/media-hosting/"),
  partnerVendorDashboard: () => axiosInstance.get("/media/partner-vendor-dashboard/"),

  // ---- Admin only ----
  upload: (formData) =>
    axiosInstance.post("/media/upload/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  all: (params = {}) => axiosInstance.get("/media/all/", { params }),
  update: (id, payload) => axiosInstance.patch(`/media/${id}/update/`, payload),
  toggle: (id) => axiosInstance.patch(`/media/${id}/toggle/`),
  toggleFeatured: (id) => axiosInstance.patch(`/media/${id}/toggle/featured/`),
  delete: (id) => axiosInstance.delete(`/media/${id}/delete/`),
  restore: (id) => axiosInstance.post(`/media/${id}/restore/`),
  archived: (params = {}) => axiosInstance.get("/media/archived/", { params }),
  reorder: (payload) => axiosInstance.post("/media/reorder/", payload),
  stats: () => axiosInstance.get("/media/stats/"),
};

export default mediaAPI;
