// src/api/videosAPI.js
import baseURL from './baseURL';

const videosAPI = {
  // ---- Core ----
  base: `${baseURL}/videos/videos/`,   // ✅ added base so videoService works
  list: `${baseURL}/videos/videos/`,
  detail: (id) => `${baseURL}/videos/videos/${id}/`,
  toggleActive: (id) => `${baseURL}/videos/videos/${id}/toggle_active/`,
  toggleFeatured: (id) => `${baseURL}/videos/videos/${id}/toggle_featured/`,

  // ---- Endpoint-specific ----
  home: `${baseURL}/videos/videos/home/`,                    
  about: `${baseURL}/videos/videos/about/`,                  
  catering: `${baseURL}/videos/videos/catering/`,            
  liveBand: `${baseURL}/videos/videos/live_band/`,           
  decor: `${baseURL}/videos/videos/decor/`,                  
  mediaHosting: `${baseURL}/videos/videos/media_hosting/`,   
  vendor: `${baseURL}/videos/videos/vendor/`,                
  partner: `${baseURL}/videos/videos/partner/`,              
  partnerVendorDashboard: `${baseURL}/videos/videos/partner_vendor_dashboard/`, 
  user: `${baseURL}/videos/videos/user/`,                    
};

export default videosAPI;
