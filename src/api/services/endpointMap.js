const endpointMap = {
  home: "home",
  about: "about",
  catering: "catering",
  liveBand: "live-band",
  decor: "decor",
  mediaHosting: "media-hosting",
  vendor: "vendor",
  partner: "partner",
  partnerVendorDashboard: "partner-vendor-dashboard",
  user: "user",
  newsletter: "newsletter",
  unsubscribe: "unsubscribe",

  // Nested resource endpoints
  videos: {
    all: "videos",
    featured: "videos/featured",
  },
  media: {
    all: "media",
    banners: "media/banners",
  },
  promotions: {
    all: "promotions",
  },
  reviews: {
    all: "reviews",
  },
  bookings: {
    all: "bookings",
    upcoming: "bookings/upcoming",
  },
  auth: {
    login: "auth/login",
    register: "auth/register",
    me: "auth/me",
  },
  contact: {
    all: "contact",
  },
  invoices: {
    all: "invoices",
  },
  messaging: {
    all: "messages",
  },
  services: {
    all: "services",
  },
  workers: {
    all: "workers",
  },
  analytics: {
    stats: "analytics/stats",
  },
  content: {
    all: "content",
    featured: "content/featured",
  },
};

export default endpointMap;
