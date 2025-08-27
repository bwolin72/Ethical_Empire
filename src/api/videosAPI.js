// src/api/videosAPI.js

const videosAPI = {
  // -------- Public-facing --------
  defaultList: "/videos/",               // GET all videos (with query params: ?endpoint=&is_active=&is_featured)
  home: "/videos/home/",                 // GET
  about: "/videos/about/",               // GET
  decor: "/videos/decor/",               // GET
  liveBand: "/videos/live_band/",        // GET
  catering: "/videos/catering/",         // GET
  mediaHosting: "/videos/media_hosting/",// GET
  vendor: "/videos/vendor/",             // GET
  partner: "/videos/partner/",           // GET
  user: "/videos/user/",                 // GET
  partnerVendorDashboard: "/videos/partner_vendor_dashboard/", // GET

  // -------- Admin-only --------
  upload: "/videos/",                    // POST (create new video)
  update: "/videos/",                    // PATCH   -> /videos/<id>/
  delete: "/videos/",                    // DELETE  -> /videos/<id>/
  toggle: "/videos/",                    // POST    -> /videos/<id>/toggle_active/
  toggleFeatured: "/videos/",            // POST    -> /videos/<id>/toggle_featured/
};

export default videosAPI;
