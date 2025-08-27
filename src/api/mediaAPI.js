// src/api/mediaAPI.js

const mediaAPI = {
  // -------- Public-facing --------
  defaultList: "/api/media/",              // GET
  banners: "/api/media/banners/",          // GET
  featured: "/api/media/featured/",        // GET

  // -------- Filtered by endpoint --------
  vendor: "/api/media/vendor/",                           // GET
  partner: "/api/media/partner/",                         // GET
  user: "/api/media/user/",                               // GET
  home: "/api/media/home/",                               // GET
  about: "/api/media/about/",                             // GET
  decor: "/api/media/decor/",                             // GET
  liveBand: "/api/media/live-band/",                      // GET
  catering: "/api/media/catering/",                       // GET
  mediaHosting: "/api/media/media-hosting/",              // GET
  partnerVendorDashboard: "/api/media/partner-vendor-dashboard/", // GET

  // -------- Admin-only --------
  upload: "/api/media/upload/",             // POST
  all: "/api/media/all/",                   // GET (admin full list)
  update: "/api/media/",                    // PATCH   -> /api/media/<id>/update/
  toggle: "/api/media/",                    // POST    -> /api/media/<id>/toggle/
  toggleFeatured: "/api/media/",            // POST    -> /api/media/<id>/toggle/featured/
  delete: "/api/media/",                    // DELETE  -> /api/media/<id>/delete/
  restore: "/api/media/",                   // POST    -> /api/media/<id>/restore/
  archived: "/api/media/archived/",         // GET
  reorder: "/api/media/reorder/",           // POST
  stats: "/api/media/stats/",               // GET

  // -------- Debug --------
  debugProto: "/api/media/debug/proto/",    // GET
};

export default mediaAPI;
