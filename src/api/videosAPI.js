// src/api/videosAPI.js

const videosAPI = {
  // -------- Public-facing --------
  defaultList: "/api/videos/",               // GET all videos (with query params: ?endpoint=&is_active=&is_featured)
  home: "/api/videos/home/",                 // GET
  about: "/api/videos/about/",               // GET
  decor: "/api/videos/decor/",               // GET
  liveBand: "/api/videos/live_band/",        // GET
  catering: "/api/videos/catering/",         // GET
  mediaHosting: "/api/videos/media_hosting/",// GET
  vendor: "/api/videos/vendor/",             // GET
  partner: "/api/videos/partner/",           // GET
  user: "/api/videos/user/",                 // GET
  partnerVendorDashboard: "/api/videos/partner_vendor_dashboard/", // GET

  // -------- Admin-only --------
  upload: "/api/videos/",                    // POST (create new video)
  update: "/api/videos/",                    // PATCH   -> /api/videos/<id>/
  delete: "/api/videos/",                    // DELETE  -> /api/videos/<id>/
  toggle: "/api/videos/",                    // POST    -> /api/videos/<id>/toggle_active/
  toggleFeatured: "/api/videos/",            // POST    -> /api/videos/<id>/toggle_featured/
};

export default videosAPI;
