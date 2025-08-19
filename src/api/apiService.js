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

const apiService = {
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
};

export default apiService;
