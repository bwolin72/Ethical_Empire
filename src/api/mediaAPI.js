// src/api/mediaAPI.js

const mediaAPI = {
  // -------- Public-facing --------
  defaultList: "/media/",                // GET -> MediaListView
  banners: "/media/banners/",            // GET -> MediaBannerListView
  featured: "/media/featured/",          // GET -> MediaFeaturedListView

  // -------- Filtered by endpoint --------
  vendor: "/media/vendor/",                                // GET -> VendorMediaListView
  partner: "/media/partner/",                              // GET -> PartnerMediaListView
  user: "/media/user/",                                    // GET -> UserMediaListView
  home: "/media/home/",                                    // GET -> HomeMediaListView
  about: "/media/about/",                                  // GET -> AboutMediaListView
  decor: "/media/decor/",                                  // GET -> DecorMediaListView
  liveBand: "/media/live-band/",                           // GET -> LiveBandMediaListView
  catering: "/media/catering/",                            // GET -> CateringMediaListView
  mediaHosting: "/media/media-hosting/",                   // GET -> MediaHostingMediaListView
  partnerVendorDashboard: "/media/partner-vendor-dashboard/", // GET -> PartnerVendorDashboardMediaListView

  // -------- Admin-only --------
  upload: "/media/upload/",               // POST -> MediaUploadView
  all: "/media/all/",                     // GET  -> MediaAllListView
  update: (id) => `/media/${id}/update/`, // PATCH -> MediaUpdateView
  toggle: (id) => `/media/${id}/toggle/`, // POST  -> MediaToggleActive
  toggleFeatured: (id) => `/media/${id}/toggle/featured/`, // POST -> MediaToggleFeatured
  delete: (id) => `/media/${id}/delete/`, // DELETE -> MediaDeleteView
  restore: (id) => `/media/${id}/restore/`, // POST -> MediaRestoreView
  archived: "/media/archived/",           // GET   -> MediaArchivedListView
  reorder: "/media/reorder/",             // POST  -> MediaReorderView
  stats: "/media/stats/",                 // GET   -> media_stats_view

  // -------- Debug --------
  debugProto: "/media/debug/proto/",      // GET -> DebugProtoView
};

export default mediaAPI;
