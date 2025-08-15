// src/api/mediaAPI.js
import baseURL from './baseURL';
import axiosInstance from './axiosInstance';
import publicAxios from './publicAxios';
import API from './api'; // so we can use videos endpoints

// Local fallback video (relative to public folder)
const FALLBACK_VIDEO_URL = '/mock/hero-video.mp4';

const mediaAPI = {
  endpoints: {
    // ===== MEDIA =====
    defaultList: `${baseURL}/media/`,
    banners: `${baseURL}/media/banners/`,
    featured: `${baseURL}/media/featured/`,
    vendor: `${baseURL}/media/vendor/`,
    partner: `${baseURL}/media/partner/`,
    userMedia: `${baseURL}/media/user/`,
    home: `${baseURL}/media/home/`,
    about: `${baseURL}/media/about/`,
    decor: `${baseURL}/media/decor/`,
    liveBand: `${baseURL}/media/live-band/`,
    catering: `${baseURL}/media/catering/`,
    mediaHosting: `${baseURL}/media/media-hosting/`,

    upload: `${baseURL}/media/upload/`,
    mediaItems: `${baseURL}/media/all/`,
    update: (id) => `${baseURL}/media/${id}/update/`,
    toggle: (id) => `${baseURL}/media/${id}/toggle/`,
    toggleFeatured: (id) => `${baseURL}/media/${id}/toggle/featured/`,
    delete: (id) => `${baseURL}/media/${id}/delete/`,
    restore: (id) => `${baseURL}/media/${id}/restore/`,
    archived: `${baseURL}/media/archived/`,
    reorder: `${baseURL}/media/reorder/`,
    stats: `${baseURL}/media/stats/`,
    debugProto: `${baseURL}/media/debug/proto/`,

    // ===== VIDEOS ===== (from api.js for consistency)
    videos: API.videos.list,
    videosHome: API.videos.home,
    videosAbout: API.videos.about,
    videosDecor: API.videos.decor,
    videosLiveBand: API.videos.liveBand,
    videosCatering: API.videos.catering,
    videosMediaHosting: API.videos.mediaHosting,
    videosVendor: API.videos.vendor,
    videosPartner: API.videos.partner,
    videosUser: API.videos.user,
    videoDetail: (id) => API.videos.detail(id),
  },

  // ===== PUBLIC METHODS (MEDIA) =====
  getDefaultList: () => publicAxios.get(mediaAPI.endpoints.defaultList),
  getBanners: () => publicAxios.get(mediaAPI.endpoints.banners),
  getFeatured: () => publicAxios.get(mediaAPI.endpoints.featured),
  getVendor: () => publicAxios.get(mediaAPI.endpoints.vendor),
  getPartner: () => publicAxios.get(mediaAPI.endpoints.partner),
  getUser: () => publicAxios.get(mediaAPI.endpoints.userMedia),
  getHome: () => publicAxios.get(mediaAPI.endpoints.home),
  getAbout: () => publicAxios.get(mediaAPI.endpoints.about),
  getDecor: () => publicAxios.get(mediaAPI.endpoints.decor),
  getLiveBand: () => publicAxios.get(mediaAPI.endpoints.liveBand),
  getCatering: () => publicAxios.get(mediaAPI.endpoints.catering),
  getMediaHosting: () => publicAxios.get(mediaAPI.endpoints.mediaHosting),

  // ===== PUBLIC METHODS (VIDEOS) =====
  getVideos: () => publicAxios.get(mediaAPI.endpoints.videos),
  getVideosHome: () => publicAxios.get(mediaAPI.endpoints.videosHome),
  getVideosAbout: () => publicAxios.get(mediaAPI.endpoints.videosAbout),
  getVideosDecor: () => publicAxios.get(mediaAPI.endpoints.videosDecor),
  getVideosLiveBand: () => publicAxios.get(mediaAPI.endpoints.videosLiveBand),
  getVideosCatering: () => publicAxios.get(mediaAPI.endpoints.videosCatering),
  getVideosMediaHosting: () => publicAxios.get(mediaAPI.endpoints.videosMediaHosting),
  getVideosVendor: () => publicAxios.get(mediaAPI.endpoints.videosVendor),
  getVideosPartner: () => publicAxios.get(mediaAPI.endpoints.videosPartner),
  getVideosUser: () => publicAxios.get(mediaAPI.endpoints.videosUser),
  getVideoDetail: (id) => publicAxios.get(mediaAPI.endpoints.videoDetail(id)),

  // ===== VIDEO FETCH WITH FALLBACK =====
  async getHeroVideo() {
    try {
      const res = await publicAxios.get(mediaAPI.endpoints.videosHome);
      if (res?.data?.length > 0 && res.data[0]?.file) {
        return res.data[0].file; // assuming "file" contains the video URL
      }
      return FALLBACK_VIDEO_URL;
    } catch (error) {
      console.error('Error fetching hero video, using fallback:', error);
      return FALLBACK_VIDEO_URL;
    }
  },

  // ===== ADMIN METHODS (MEDIA) =====
  upload: (data) => axiosInstance.post(mediaAPI.endpoints.upload, data),
  getAll: () => axiosInstance.get(mediaAPI.endpoints.mediaItems),
  update: (id, data) => axiosInstance.patch(mediaAPI.endpoints.update(id), data),
  toggle: (id) => axiosInstance.post(mediaAPI.endpoints.toggle(id)),
  toggleFeatured: (id) => axiosInstance.post(mediaAPI.endpoints.toggleFeatured(id)),
  delete: (id) => axiosInstance.delete(mediaAPI.endpoints.delete(id)),
  restore: (id) => axiosInstance.post(mediaAPI.endpoints.restore(id)),
  getArchived: () => axiosInstance.get(mediaAPI.endpoints.archived),
  reorder: (data) => axiosInstance.post(mediaAPI.endpoints.reorder, data),
  getStats: () => axiosInstance.get(mediaAPI.endpoints.stats),
  debugProto: () => axiosInstance.get(mediaAPI.endpoints.debugProto),
};

export default mediaAPI;
