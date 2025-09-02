// src/api/videosAPI.js
import baseURL from "./baseURL";

const videosAPI = {
  // -------- Public-facing --------
  defaultList: `${baseURL}/videos/`,                    // GET all videos (query params: ?endpoint=&is_active=&is_featured)
  home: `${baseURL}/videos/home/`,                      // GET -> VideoViewSet.home
  about: `${baseURL}/videos/about/`,                    // GET -> VideoViewSet.about
  decor: `${baseURL}/videos/decor/`,                    // GET -> VideoViewSet.decor
  liveBand: `${baseURL}/videos/live_band/`,             // GET -> VideoViewSet.live_band
  catering: `${baseURL}/videos/catering/`,             // GET -> VideoViewSet.catering
  mediaHosting: `${baseURL}/videos/media_hosting/`,    // GET -> VideoViewSet.media_hosting
  vendor: `${baseURL}/videos/vendor/`,                  // GET -> VideoViewSet.vendor
  partner: `${baseURL}/videos/partner/`,                // GET -> VideoViewSet.partner
  user: `${baseURL}/videos/user/`,                      // GET -> VideoViewSet.user
  partnerVendorDashboard: `${baseURL}/videos/partner_vendor_dashboard/`, // GET -> VideoViewSet.partner_vendor_dashboard

  // -------- Admin-only --------
  upload: `${baseURL}/videos/`,                          // POST -> create new video
  update: (id) => `${baseURL}/videos/${id}/`,           // PATCH -> update video by ID
  delete: (id) => `${baseURL}/videos/${id}/`,           // DELETE -> delete video by ID
  toggle: (id) => `${baseURL}/videos/${id}/toggle_active/`,    // POST -> toggle active status
  toggleFeatured: (id) => `${baseURL}/videos/${id}/toggle_featured/`, // POST -> toggle featured status
};

export default videosAPI;
