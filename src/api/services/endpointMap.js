// src/api/endpointMap.js
/**
 * Central mapping between frontend keys and backend endpoint codes.
 * Used by useFetcher for media & videos.
 */
const endpointMap = {
  home: "EethmHome",
  about: "About",
  catering: "CateringServicePage",
  liveBand: "LiveBandServicePage",
  decor: "DecorServicePage",
  mediaHosting: "MediaHostingServicePage",
  vendor: "VendorPage",
  partner: "PartnerPage",
  partnerVendorDashboard: "PartnerVendorDashboard", // added for AgencyDashboard
  user: "UserPage",
};

export default endpointMap;
