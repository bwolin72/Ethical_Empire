// src/api/mediaAPI.js

const mediaAPI = {
  // -------- Public-facing --------
  defaultList: "/media/",              // GET
  banners: "/media/banners/",          // GET
  featured: "/media/featured/",        // GET

  // -------- Filtered by endpoint --------
  vendor: "/media/vendor/",                           // GET
  partner: "/media/partner/",                         // GET
  user: "/media/user/",                               // GET
  home: "/media/home/",                               // GET
  about: "/media/about/",                             // GET
  decor: "/media/decor/",                             // GET
  liveBand: "/media/live-band/",                      // GET
  catering: "/media/catering/",                       // GET
  mediaHosting: "/media/media-hosting/",              // GET
  partnerVendorDashboard: "/media/partner-vendor-dashboard/", // GET

  // -------- Admin-only --------
  upload: "/media/upload/",             // POST
  all: "/media/all/",                   // GET (admin full list)
  update: "/media/",                    // PATCH   -> /media/<id>/update/
  toggle: "/media/",                    // POST    -> /media/<id>/toggle/
  toggleFeatured: "/media/",            // POST    -> /media/<id>/toggle/featured/
  delete: "/media/",                    // DELETE  -> /media/<id>/delete/
  restore: "/media/",                   // POST    -> /media/<id>/restore/
  archived: "/media/archived/",         // GET
  reorder: "/media/reorder/",           // POST
  stats: "/media/stats/",               // GET

  // -------- Debug --------
  debugProto: "/media/debug/proto/",    // GET
};

export default mediaAPI;
