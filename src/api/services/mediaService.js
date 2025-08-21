import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import API from '../api';

const mediaService = {
  // -------- Public-facing --------
  getMedia: () => publicAxios.get(API.media.defaultList),   // ''
  getBanners: () => publicAxios.get(API.media.banners),      // 'banners/'
  getFeaturedMedia: () => publicAxios.get(API.media.featured), // 'featured/'

  // -------- Admin & management --------
  getAllMedia: () => publicAxios.get(API.media.all),        // 'all/'
  getArchivedMedia: () => publicAxios.get(API.media.archived), // 'archived/'

  // -------- Filtered lists --------
  getHomeMedia: () => publicAxios.get(API.media.home),          // 'home/'
  getAboutMedia: () => publicAxios.get(API.media.about),        // 'about/'
  getDecorMedia: () => publicAxios.get(API.media.decor),        // 'decor/'
  getLiveBandMedia: () => publicAxios.get(API.media.liveBand),  // 'live-band/'
  getCateringMedia: () => publicAxios.get(API.media.catering),  // 'catering/'
  getMediaHostingMedia: () => publicAxios.get(API.media.mediaHosting), // 'media-hosting/'
  getVendorMedia: () => publicAxios.get(API.media.vendor),      // 'vendor/'
  getPartnerMedia: () => publicAxios.get(API.media.partner),    // 'partner/'
  getUserMedia: () => publicAxios.get(API.media.user),          // 'user/'

  // -------- Mutations --------
  uploadMedia: (data) => axiosInstance.post(API.media.upload, data), // 'upload/'
  updateMedia: (id, data) => axiosInstance.patch(API.media.update(id), data), // '<id>/update/'
  toggleMediaActive: (id) => axiosInstance.post(API.media.toggle(id)), // '<id>/toggle/'
  toggleMediaFeatured: (id) => axiosInstance.post(API.media.toggleFeatured(id)), // '<id>/toggle/featured/'
  deleteMedia: (id) => axiosInstance.delete(API.media.delete(id)), // '<id>/delete/'
  restoreMedia: (id) => axiosInstance.post(API.media.restore(id)), // '<id>/restore/'

  // -------- Utils --------
  reorderMedia: (data) => axiosInstance.post(API.media.reorder, data), // 'reorder/'
  getMediaStats: () => axiosInstance.get(API.media.stats), // 'stats/'
  debugMediaProto: () => axiosInstance.get(API.media.debugProto), // 'debug/proto/'
};

export default mediaService;
