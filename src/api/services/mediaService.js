import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import API from '../api';

const mediaService = {
  getMedia: () => publicAxios.get(API.media.defaultList),
  getBanners: () => publicAxios.get(API.media.banners),
  getFeaturedMedia: () => publicAxios.get(API.media.featured),
  getArchivedMedia: () => publicAxios.get(API.media.archived),
  getMediaItems: () => publicAxios.get(API.media.mediaItems),

  getHomeMedia: () => publicAxios.get(API.media.home),
  getAboutMedia: () => publicAxios.get(API.media.about),
  getDecorMedia: () => publicAxios.get(API.media.decor),
  getLiveBandMedia: () => publicAxios.get(API.media.liveBand),
  getCateringMedia: () => publicAxios.get(API.media.catering),
  getMediaHostingMedia: () => publicAxios.get(API.media.mediaHosting),
  getVendorMedia: () => publicAxios.get(API.media.vendor),
  getPartnerMedia: () => publicAxios.get(API.media.partner),
  getUserMedia: () => publicAxios.get(API.media.userMedia),

  uploadMedia: (data) => axiosInstance.post(API.media.upload, data),
  updateMedia: (id, data) => axiosInstance.patch(API.media.update(id), data),
  toggleMediaActive: (id) => axiosInstance.post(API.media.toggle(id)),
  toggleMediaFeatured: (id) => axiosInstance.post(API.media.toggleFeatured(id)),
  deleteMedia: (id) => axiosInstance.delete(API.media.delete(id)),
  restoreMedia: (id) => axiosInstance.post(API.media.restore(id)),
  reorderMedia: (data) => axiosInstance.post(API.media.reorder, data),
  getMediaStats: () => axiosInstance.get(API.media.stats),
  debugMediaProto: () => axiosInstance.get(API.media.debugProto),
};

export default mediaService;
