import baseURL from "./baseURL";

const videosAPI = {
  // -------- Public-facing --------
  list: `${baseURL}/api/videos/videos/`,                        // GET all videos
  home: `${baseURL}/api/videos/videos/home/`,                   // GET home videos
  about: `${baseURL}/api/videos/videos/about/`,                 // GET about videos
  decor: `${baseURL}/api/videos/videos/decor/`,                 // GET decor videos
  liveBand: `${baseURL}/api/videos/videos/live_band/`,          // GET live band videos
  catering: `${baseURL}/api/videos/videos/catering/`,           // GET catering videos
  mediaHosting: `${baseURL}/api/videos/videos/media_hosting/`,  // GET media hosting videos
  vendor: `${baseURL}/api/videos/videos/vendor/`,               // GET vendor videos
  partner: `${baseURL}/api/videos/videos/partner/`,             // GET partner videos
  user: `${baseURL}/api/videos/videos/user/`,                   // GET user videos
  partnerVendorDashboard: `${baseURL}/api/videos/videos/partner_vendor_dashboard/`,

  // -------- Admin-only --------
  upload: `${baseURL}/api/videos/videos/`,                        // POST -> create new video
  update: (id) => `${baseURL}/api/videos/videos/${id}/`,           // PATCH -> update video
  delete: (id) => `${baseURL}/api/videos/videos/${id}/`,           // DELETE -> remove video
  toggle: (id) => `${baseURL}/api/videos/videos/${id}/toggle_active/`,     
  toggleFeatured: (id) => `${baseURL}/api/videos/videos/${id}/toggle_featured/`
};

export default videosAPI;
