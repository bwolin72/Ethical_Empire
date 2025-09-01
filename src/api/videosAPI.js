// src/api/videosAPI.js

const videosAPI = {
  // -------- Public-facing --------
  defaultList: "/videos/",                    // GET all videos (query params: ?endpoint=&is_active=&is_featured)
  home: "/videos/home/",                      // GET -> VideoViewSet.home
  about: "/videos/about/",                    // GET -> VideoViewSet.about
  decor: "/videos/decor/",                    // GET -> VideoViewSet.decor
  liveBand: "/videos/live_band/",             // GET -> VideoViewSet.live_band
  catering: "/videos/catering/",             // GET -> VideoViewSet.catering
  mediaHosting: "/videos/media_hosting/",    // GET -> VideoViewSet.media_hosting
  vendor: "/videos/vendor/",                  // GET -> VideoViewSet.vendor
  partner: "/videos/partner/",                // GET -> VideoViewSet.partner
  user: "/videos/user/",                      // GET -> VideoViewSet.user
  partnerVendorDashboard: "/videos/partner_vendor_dashboard/", // GET -> VideoViewSet.partner_vendor_dashboard

  // -------- Admin-only --------
  upload: "/videos/",                          // POST -> create new video
  update: (id) => `/videos/${id}/`,           // PATCH -> update video by ID
  delete: (id) => `/videos/${id}/`,           // DELETE -> delete video by ID
  toggle: (id) => `/videos/${id}/toggle_active/`,    // POST -> toggle active status
  toggleFeatured: (id) => `/videos/${id}/toggle_featured/`, // POST -> toggle featured status
};

export default videosAPI;
