// src/services/videoService.js
import videosAPI from "../videosAPI";

// Helper to normalize API response to consistent frontend format
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
  // ---------------- CRUD ----------------
  async getAll(filters = {}) {
    const { data } = await videosAPI.list(filters);
    return data.map(normalizeVideo);
  },

  async getById(id) {
    const { data } = await videosAPI.retrieve(id);
    return normalizeVideo(data);
  },

  async create(videoData) {
    const { data } = await videosAPI.create(videoData);
    return normalizeVideo(data);
  },

  async update(id, videoData) {
    const { data } = await videosAPI.update(id, videoData);
    return normalizeVideo(data);
  },

  async partialUpdate(id, videoData) {
    // If partialUpdate is needed, use patch with the same update endpoint
    const { data } = await videosAPI.update(id, videoData);
    return normalizeVideo(data);
  },

  async remove(id) {
    await videosAPI.delete(id);
    return true;
  },

  // ---------------- Toggles ----------------
  async toggleActive(id) {
    const { data } = await videosAPI.toggleActive(id);
    return data;
  },

  async toggleFeatured(id) {
    const { data } = await videosAPI.toggleFeatured(id);
    return data;
  },

  // ---------------- Public endpoint-specific helpers ----------------
  async getHome() {
    const { data } = await videosAPI.home();
    return data.map(normalizeVideo);
  },

  async getAbout() {
    const { data } = await videosAPI.about();
    return data.map(normalizeVideo);
  },

  async getDecor() {
    const { data } = await videosAPI.decor();
    return data.map(normalizeVideo);
  },

  async getLiveBand() {
    const { data } = await videosAPI.liveBand();
    return data.map(normalizeVideo);
  },

  async getCatering() {
    const { data } = await videosAPI.catering();
    return data.map(normalizeVideo);
  },

  async getMediaHosting() {
    const { data } = await videosAPI.mediaHosting();
    return data.map(normalizeVideo);
  },

  async getUserPage() {
    const { data } = await videosAPI.user();
    return data.map(normalizeVideo);
  },

  async getVendorPage() {
    const { data } = await videosAPI.vendor();
    return data.map(normalizeVideo);
  },

  async getPartnerPage() {
    const { data } = await videosAPI.partner();
    return data.map(normalizeVideo);
  },

  async getPartnerDashboard() {
    const { data } = await videosAPI.partnerDashboard();
    return data.map(normalizeVideo);
  },

  async getAgencyDashboard() {
    const { data } = await videosAPI.agencyDashboard();
    return data.map(normalizeVideo);
  },
};

export default videoService;
