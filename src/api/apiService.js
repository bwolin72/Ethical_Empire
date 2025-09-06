// src/api/apiService.js

import authService from './services/authService';
import messagingService from './services/messagingService';
import mediaService from './services/mediaService';
import videoService from './services/videoService';
import serviceService from './services/serviceService';
import promotionService from './services/promotionService';
import newsletterService from './services/newsletterService';
import reviewService from './services/reviewService';
import bookingService from './services/bookingService';
import invoiceService from './services/invoiceService';
import contactService from './services/contactService';
import analyticsService from './services/analyticsService';
import miscService from './services/miscService';

// ✅ Import your contentService (shorthand endpoints)
import contentService from './services/contentService';

const apiService = {
  // ----- Core Services -----
  auth: authService,
  messaging: messagingService,
  media: mediaService,
  videos: videoService,
  services: serviceService,
  promotions: promotionService,
  newsletter: newsletterService,
  reviews: reviewService,
  bookings: bookingService,
  invoices: invoiceService,
  contact: contactService,
  analytics: analyticsService,
  misc: miscService,

  // ----- Shorthand methods (for Home + global use) -----
  getVideos: contentService.getVideos,
  getPromotions: contentService.getPromotions,
  getReviews: contentService.getReviews,
  getBanners: contentService.getBanners,
  getMedia: contentService.getMedia,
};

export default apiService;
