// D:\New folder\ethical_empire\frontend\src\api\services\mediaService.js
import axiosInstance from '../axiosInstance';
import publicAxios from '../publicAxios';

/**
 * Base URL for the Django media endpoints (adjust prefix if your API is mounted elsewhere)
 * e.g. if backend url is /api/media/, set MEDIA_BASE = '/api/media'
 */
const MEDIA_BASE = '/media';

const mediaService = {
  /* ------------------------------------------------------------------
   * PUBLIC ENDPOINTS
   * ------------------------------------------------------------------ */

  /**
   * List media with optional query parameters
   * @param {Object} params - e.g. { endpoint: 'UserPage', type: 'banner', page: 1 }
   */
  async list(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/`, { params });
    return data;
  },

  /**
   * Banners (active, type='banner')
   */
  async listBanners(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/banners/`, { params });
    return data;
  },

  /**
   * Featured media (type='media', is_featured=true)
   */
  async listFeatured(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/featured/`, { params });
    return data;
  },

  /**
   * Endpoint-specific lists (VendorPage, PartnerPage, etc.)
   * Each method maps exactly to urls.py paths.
   */
  async listVendor(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/vendor/`, { params });
    return data;
  },
  async listPartner(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/partner/`, { params });
    return data;
  },
  async listUser(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/user/`, { params });
    return data;
  },
  async listHome(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/home/`, { params });
    return data;
  },
  async listAbout(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/about/`, { params });
    return data;
  },
  async listDecor(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/decor/`, { params });
    return data;
  },
  async listLiveBand(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/live-band/`, { params });
    return data;
  },
  async listCatering(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/catering/`, { params });
    return data;
  },
  async listMediaHosting(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/media-hosting/`, { params });
    return data;
  },
  async listPartnerVendorDashboard(params = {}) {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/partner-vendor-dashboard/`, { params });
    return data;
  },

  /**
   * Media statistics (admin-only view but GET is publicAxios if you handle auth externally)
   */
  async stats() {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/stats/`);
    return data; // { total, active, banners, videos, images }
  },

  /* ------------------------------------------------------------------
   * ADMIN-ONLY ENDPOINTS  (require authentication via axiosInstance)
   * ------------------------------------------------------------------ */

  /**
   * Upload one or many media files.
   * @param {File[]|FileList} files
   * @param {Object} extra - { type: 'media'|'banner', endpoint: string[]|string, ... }
   */
  async upload(files, extra = {}) {
    const formData = new FormData();

    // Backend expects key "media" for each file
    [...files].forEach((file) => formData.append('media', file));

    // Additional fields: type, endpoint(s), label, is_active, is_featured
    Object.entries(extra).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        // DRF accepts multiple endpoint keys by repeating the field
        val.forEach((v) => formData.append(key, v));
      } else {
        formData.append(key, val);
      }
    });

    const { data } = await axiosInstance.post(`${MEDIA_BASE}/upload/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data; // { message, items: [...] }
  },

  /**
   * Update an existing media record (PATCH).
   * Supports changing endpoints, label, is_active, is_featured, etc.
   */
  async update(id, payload) {
    const { data } = await axiosInstance.patch(`${MEDIA_BASE}/${id}/update/`, payload);
    return data; // { message, data: {...updated object...} }
  },

  /**
   * Toggle active flag (PATCH)
   */
  async toggleActive(id) {
    const { data } = await axiosInstance.patch(`${MEDIA_BASE}/${id}/toggle/`);
    return data; // { id, is_active }
  },

  /**
   * Toggle featured flag (PATCH)
   */
  async toggleFeatured(id) {
    const { data } = await axiosInstance.patch(`${MEDIA_BASE}/${id}/toggle/featured/`);
    return data; // { id, is_featured }
  },

  /**
   * Soft delete (DELETE)
   */
  async softDelete(id) {
    const { data } = await axiosInstance.delete(`${MEDIA_BASE}/${id}/delete/`);
    return data; // { detail, id }
  },

  /**
   * Restore a soft-deleted media (POST)
   */
  async restore(id) {
    const { data } = await axiosInstance.post(`${MEDIA_BASE}/${id}/restore/`);
    return data; // { detail, data: {...media...} }
  },

  /**
   * List all media (admin), optional ?include_deleted=true
   */
  async listAll(params = {}) {
    const { data } = await axiosInstance.get(`${MEDIA_BASE}/all/`, { params });
    return data;
  },

  /**
   * List archived (soft-deleted) media (admin)
   */
  async listArchived(params = {}) {
    const { data } = await axiosInstance.get(`${MEDIA_BASE}/archived/`, { params });
    return data;
  },

  /**
   * Reorder media (admin) – expects array of {id, position}
   */
  async reorder(orderArray) {
    const { data } = await axiosInstance.post(`${MEDIA_BASE}/reorder/`, orderArray);
    return data; // { message: 'Reordering applied' }
  },

  /**
   * Debug Proto endpoint (optional)
   */
  async debugProto() {
    const { data } = await publicAxios.get(`${MEDIA_BASE}/debug/proto/`);
    return data;
  },
};

export default mediaService;
