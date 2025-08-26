// src/api/services/videoService.js
import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import videosAPI from '../videosAPI';

// ---- Endpoint constants from backend VIDEO_ENDPOINT_CHOICES ----
export const VIDEO_ENDPOINTS = {
  HOME: 'EethmHome',
  USER_PAGE: 'UserPage',
  ABOUT: 'About',
  CATERING: 'CateringServicePage',
  LIVE_BAND: 'LiveBandServicePage',
  DECOR: 'DecorServicePage',
  MEDIA_HOSTING: 'MediaHostingServicePage',
  VENDOR_PAGE: 'VendorPage',
  PARTNER_PAGE: 'PartnerPage',
  PARTNER_VENDOR_DASHBOARD: 'PartnerVendorDashboard',
};

// ---- Build FormData for file uploads ----
export function buildVideoFormData(video = {}) {
  const fd = new FormData();

  if (video.title) fd.append('title', video.title);
  if (video.description) fd.append('description', video.description);
  if (video.video_file) fd.append('video_file', video.video_file);
  if (video.thumbnail) fd.append('thumbnail', video.thumbnail);

  if (Array.isArray(video.endpoints)) {
    fd.append('endpoints', JSON.stringify(video.endpoints));
  } else if (typeof video.endpoints === 'string' && video.endpoints) {
    fd.append('endpoints', JSON.stringify([video.endpoints]));
  }

  if (video.is_active !== undefined) fd.append('is_active', String(video.is_active));
  if (video.is_featured !== undefined) fd.append('is_featured', String(video.is_featured));

  return fd;
}

// ---- Service methods ----
const videoService = {
  // ---- Public ----
  getAll: (params = {}) => publicAxios.get(videosAPI.list, { params }),
  getByEndpoint: (endpoint, params = {}) =>
    publicAxios.get(videosAPI.byEndpoint(endpoint, params)),

  getHome: () => publicAxios.get(videosAPI.home),
  getAbout: () => publicAxios.get(videosAPI.about),
  getDecor: () => publicAxios.get(videosAPI.decor),
  getLiveBand: () => publicAxios.get(videosAPI.liveBand),
  getCatering: () => publicAxios.get(videosAPI.catering),
  getMediaHosting: () => publicAxios.get(videosAPI.mediaHosting),
  getVendor: () => publicAxios.get(videosAPI.vendor),
  getPartner: () => publicAxios.get(videosAPI.partner),
  getUserPage: () => publicAxios.get(videosAPI.user),
  getPartnerVendorDashboard: () => publicAxios.get(videosAPI.partnerVendorDashboard),

  getFeatured: () => publicAxios.get(videosAPI.list, { params: { is_featured: true } }),

  // ---- Admin (auth required) ----
  adminList: (params = {}) => axiosInstance.get(videosAPI.list, { params }),
  adminRetrieve: (id) => axiosInstance.get(videosAPI.detail(id)),
  adminCreate: (formData) =>
    axiosInstance.post(videosAPI.list, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  adminUpdate: (id, formData) =>
    axiosInstance.patch(videosAPI.detail(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  adminDelete: (id) => axiosInstance.delete(videosAPI.detail(id)),

  toggleActive: (id) => axiosInstance.post(videosAPI.toggleActive(id)),
  toggleFeatured: (id) => axiosInstance.post(videosAPI.toggleFeatured(id)),
};

export default videoService;
