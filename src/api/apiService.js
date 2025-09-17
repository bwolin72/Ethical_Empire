// src/api/apiService.js

import authAPI from './authAPI';
import messagingAPI from './messagingAPI';
import mediaAPI from './mediaAPI';
import videosAPI from './videosAPI';
import servicesAPI from './servicesAPI';
import promotionsAPI from './promotionsAPI';
import newsletterAPI from './newsletterAPI';
import reviewsAPI from './reviewsAPI';
import bookingAPI from './bookingAPI';
import invoicesAPI from './invoicesAPI';
import contactAPI from './contactAPI';
import analyticsAPI from './analyticsAPI';
import miscAPI from './miscAPI';
import baseURL from './baseURL';  // ✅ make sure you have this already

// ---- Raw endpoints for fetcher hooks ----
export const API_ENDPOINTS = {
  // About page specific
  aboutHeroMedia: `${baseURL}/media/about/`,
  aboutBanners: `${baseURL}/media/banners/`,
  gallery: `${baseURL}/media/home/`,

  // Global/common
  reviews: `${baseURL}/reviews/`,
  services: `${baseURL}/services/`,
  videos: `${baseURL}/videos/videos/`,
  promotions: `${baseURL}/promotions/`,
};

// ---- Service-driven API object ----
const apiService = {
  auth: authAPI,
  messaging: messagingAPI,
  media: mediaAPI,
  videos: videosAPI,
  services: servicesAPI,
  promotions: promotionsAPI,
  newsletter: newsletterAPI,
  reviews: reviewsAPI,
  bookings: bookingAPI,
  invoices: invoicesAPI,
  contact: contactAPI,
  analytics: analyticsAPI,
  misc: miscAPI,
};

export default apiService;
