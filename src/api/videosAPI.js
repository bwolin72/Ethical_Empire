import baseURL from "./baseURL";

const videosAPI = {
  // -------- Public-facing --------
  list: `${baseURL}/videos/videos/`,                        // GET all videos
  home: `${baseURL}/videos/videos/home/`,                   // GET home videos
  about: `${baseURL}/videos/videos/about/`,                 // GET about videos
  decor: `${baseURL}/videos/videos/decor/`,                 // GET decor videos
  liveBand: `${baseURL}/videos/videos/live_band/`,          // GET live band videos
  catering: `${baseURL}/videos/videos/catering/`,           // GET catering videos
  mediaHosting: `${baseURL}/videos/videos/media_hosting/`,  // GET media hosting videos
  vendor: `${baseURL}/videos/videos/vendor/`,               // GET vendor videos
  partner: `${baseURL}/videos/videos/partner/`,             // GET partner videos
  user: `${baseURL}/videos/videos/user/`,                   // GET user videos
  partnerVendorDashboard: `${baseURL}/videos/videos/partner_vendor_dashboard/`,

  // -------- Admin-only --------
  upload: `${baseURL}/videos/videos/`,                        // POST -> create new video
  update: (id) => `${baseURL}/videos/videos/${id}/`,           // PATCH -> update video
  delete: (id) => `${baseURL}/videos/videos/${id}/`,           // DELETE -> remove video
  toggle: (id) => `${baseURL}/videos/videos/${id}/toggle_active/`,     
  toggleFeatured: (id) => `${baseURL}/videos/videos/${id}/toggle_featured/`
};

export default videosAPI;
