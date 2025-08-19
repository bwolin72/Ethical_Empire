// src/api/videosAPI.js
import baseURL from './baseURL';

const videosAPI = {
  // ---- Core ----
  list: `${baseURL}/videos/videos/`,
  detail: (id) => `${baseURL}/videos/videos/${id}/`,
  toggleActive: (id) => `${baseURL}/videos/videos/${id}/toggle_active/`,
  toggleFeatured: (id) => `${baseURL}/videos/videos/${id}/toggle_featured/`,

  // ---- Endpoint-specific ----
  home: `${baseURL}/videos/videos/home/`,                    // → EethmHome
  about: `${baseURL}/videos/videos/about/`,                  // → About
  catering: `${baseURL}/videos/videos/catering/`,            // → CateringPage
  liveBand: `${baseURL}/videos/videos/live_band/`,           // → LiveBandServicePage
  decor: `${baseURL}/videos/videos/decor/`,                  // → DecorPage
  mediaHosting: `${baseURL}/videos/videos/media_hosting/`,   // → MediaHostingServicePage
  vendor: `${baseURL}/videos/videos/vendor/`,                // → VendorPage
  partner: `${baseURL}/videos/videos/partner/`,              // → PartnerPage
  partnerVendorDashboard: `${baseURL}/videos/videos/partner_vendor_dashboard/`, 
  user: `${baseURL}/videos/videos/user/`,                    // → UserPage
};

export default videosAPI;
