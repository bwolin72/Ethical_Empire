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

  /* -----------------------------
     Nested Resource Endpoints
     ----------------------------- */
  videos: {
    all: "videos/videos/",
    home: "videos/videos/home/",
    user: "media/user",    
    about: "videos/videos/about/",
    decor: "videos/videos/decor/",
    catering: "videos/videos/catering/",
    liveBand: "videos/videos/liveband/",
    mediaHosting: "videos/videos/mediahosting/",
  },

  media: {
    all: "media/",
    home: "media/home/",
    decor: "media/decor/",
    catering: "media/catering/",
    user: "media/user",
    liveBand: "media/liveband/",
    banners: "media/banners/",
  },

  services: {
    all: "services/services/categories/",
    categories: "services/services/categories/",
    liveBand: "services/services/categories/?slug=live-band",
  },

  reviews: {
    all: "reviews/",
  },

  bookings: {
    all: "bookings/",
    upcoming: "bookings/upcoming/",
  },

  contact: { all: "contact/" },
  invoices: { all: "invoices/" },
  messaging: { all: "messages/" },
  workers: { all: "workers/" },
  analytics: { stats: "analytics/stats/" },
  promotions: { all: "promotions/" },
  auth: {
    login: "auth/login/",
    register: "auth/register/",
    me: "auth/me/",
  },
  content: {
    all: "content/",
    featured: "content/featured/",
  },
};

export default endpointMap;
