// src/api/mediaAPI.js
import baseURL from "./baseURL";

const mediaAPI = {
  // -------- Public-facing --------
  defaultList: `${baseURL}/media/`,                // GET -> MediaListView
  banners: `${baseURL}/media/banners/`,            // GET -> MediaBannerListView
  featured: `${baseURL}/media/featured/`,          // GET -> MediaFeaturedListView

  // -------- Filtered by endpoint --------
  vendor: `${baseURL}/media/vendor/`,                                // GET -> VendorMediaListView
  partner: `${baseURL}/media/partner/`,                              // GET -> PartnerMediaListView
  user: `${baseURL}/media/user/`,                                    // GET -> UserMediaListView
  home: `${baseURL}/media/home/`,                                    // GET -> HomeMediaListView
  about: `${baseURL}/media/about/`,                                  // GET -> AboutMediaListView
  decor: `${baseURL}/media/decor/`,                                  // GET -> DecorMediaListView
  liveBand: `${baseURL}/media/live-band/`,                           // GET -> LiveBandMediaListView
  catering: `${baseURL}/media/catering/`,                            // GET -> CateringMediaListView
  mediaHosting: `${baseURL}/media/media-hosting/`,                   // GET -> MediaHostingMediaListView
  partnerVendorDashboard: `${baseURL}/media/partner-vendor-dashboard/`, // GET -> PartnerVendorDashboardMediaListView

  // -------- Admin-only --------
  upload: `${baseURL}/media/upload/`,               // POST -> MediaUploadView
  all: `${baseURL}/media/all/`,                     // GET  -> MediaAllListView
  update: (id) => `${baseURL}/media/${id}/update/`, // PATCH -> MediaUpdateView
  toggle: (id) => `${baseURL}/media/${id}/toggle/`, // POST  -> MediaToggleActive
  toggleFeatured: (id) => `${baseURL}/media/${id}/toggle/featured/`, // POST -> MediaToggleFeatured
  delete: (id) => `${baseURL}/media/${id}/delete/`, // DELETE -> MediaDeleteView
  restore: (id) => `${baseURL}/media/${id}/restore/`, // POST -> MediaRestoreView
  archived: `${baseURL}/media/archived/`,           // GET   -> MediaArchivedListView
  reorder: `${baseURL}/media/reorder/`,             // POST  -> MediaReorderView
  stats: `${baseURL}/media/stats/`,                 // GET   -> media_stats_view

  // -------- Debug --------
  debugProto: `${baseURL}/media/debug/proto/`,      // GET -> DebugProtoView
};

export default mediaAPI;
