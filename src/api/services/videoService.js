// videoService.js
// High-level service functions wrapping videosAPI for UI components.

import videosAPI from "../videosAPI";

const normalizeVideo = (v) => ({
  id: v.id,
  title: v.title,
  description: v.description,
  videoUrl: v.video_url,
  thumbnailUrl: v.thumbnail_url,
  endpoints: v.endpoints,
  endpointsDisplay: v.endpoints_display,
  isActive: v.is_active,
  isFeatured: v.is_featured,
  uploadedAt: v.uploaded_at,
});

export const videoService = {
  async getAll(filters = {}) {
    const data = await videosAPI.list(filters);
    return data.map(normalizeVideo);
  },

  async getById(id) {
    const v = await videosAPI.retrieve(id);
    return normalizeVideo(v);
  },

  async create(videoData) {
    const v = await videosAPI.create(videoData);
    return normalizeVideo(v);
  },

  async update(id, videoData) {
    const v = await videosAPI.update(id, videoData);
    return normalizeVideo(v);
  },

  async partialUpdate(id, videoData) {
    const v = await videosAPI.partialUpdate(id, videoData);
    return normalizeVideo(v);
  },

  async remove(id) {
    await videosAPI.delete(id);
    return true;
  },

  async toggleActive(id) {
    return videosAPI.toggleActive(id);
  },

  async toggleFeatured(id) {
    return videosAPI.toggleFeatured(id);
  },

  // --------- Public endpoint-specific helpers ---------
  async getHome() { return (await videosAPI.home()).map(normalizeVideo); },
  async getAbout() { return (await videosAPI.about()).map(normalizeVideo); },
  async getDecor() { return (await videosAPI.decor()).map(normalizeVideo); },
  async getLiveBand() { return (await videosAPI.liveBand()).map(normalizeVideo); },
  async getCatering() { return (await videosAPI.catering()).map(normalizeVideo); },
  async getMediaHosting() { return (await videosAPI.mediaHosting()).map(normalizeVideo); },
  async getUserPage() { return (await videosAPI.user()).map(normalizeVideo); },
  async getVendorPage() { return (await videosAPI.vendor()).map(normalizeVideo); },
  async getPartnerPage() { return (await videosAPI.partner()).map(normalizeVideo); },
  async getPartnerDashboard() { return (await videosAPI.partnerDashboard()).map(normalizeVideo); },
  async getAgencyDashboard() { return (await videosAPI.agencyDashboard()).map(normalizeVideo); },
};

export default videoService;
