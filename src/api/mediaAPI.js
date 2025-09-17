import privateAxios from "./axiosInstance";
import publicAxios from "./publicAxios";

/**
 * ----------------------
 *  Admin-only endpoints
 *  (require auth -> use privateAxios)
 * ----------------------
 */

// Upload one or multiple media files
export function uploadMedia(formData) {
  return privateAxios.post("/media/upload/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

// Get all media (optionally include deleted with ?include_deleted=true)
export function fetchAllMedia(params) {
  return privateAxios.get("/media/all/", { params });
}

// Update a single media file (partial update)
export function updateMedia(id, payload) {
  return privateAxios.patch(`/media/${id}/update/`, payload);
}

// Toggle active status
export function toggleActive(id) {
  return privateAxios.patch(`/media/${id}/toggle/`);
}

// Toggle featured status
export function toggleFeatured(id) {
  return privateAxios.patch(`/media/${id}/toggle/featured/`);
}

// Soft delete media
export function deleteMedia(id) {
  return privateAxios.delete(`/media/${id}/delete/`);
}

// Restore a previously soft-deleted media file
export function restoreMedia(id) {
  return privateAxios.post(`/media/${id}/restore/`);
}

// List of soft-deleted (archived) media files
export function fetchArchivedMedia(params) {
  return privateAxios.get("/media/archived/", { params });
}

// Reorder media files (expects array of {id, position})
export function reorderMedia(data) {
  return privateAxios.post("/media/reorder/", data);
}

// Statistics: total, active, banners, videos, images
export function fetchMediaStats() {
  return privateAxios.get("/media/stats/");
}

/**
 * ----------------------
 *  Public endpoints
 *  (no auth -> use publicAxios)
 * ----------------------
 */

// General list with query params (?type=banner&endpoint=EethmHome...)
export function fetchMediaList(params) {
  return publicAxios.get("/media/", { params });
}

// Banners only
export function fetchBannerMedia(params) {
  return publicAxios.get("/media/banners/", { params });
}

// Featured media only
export function fetchFeaturedMedia(params) {
  return publicAxios.get("/media/featured/", { params });
}

// Endpoint-filtered groups
export function fetchVendorMedia(params) {
  return publicAxios.get("/media/vendor/", { params });
}

export function fetchPartnerMedia(params) {
  return publicAxios.get("/media/partner/", { params });
}

export function fetchUserMedia(params) {
  return publicAxios.get("/media/user/", { params });
}

export function fetchHomeMedia(params) {
  return publicAxios.get("/media/home/", { params });
}

export function fetchAboutMedia(params) {
  return publicAxios.get("/media/about/", { params });
}

export function fetchDecorMedia(params) {
  return publicAxios.get("/media/decor/", { params });
}

export function fetchLiveBandMedia(params) {
  return publicAxios.get("/media/live-band/", { params });
}

export function fetchCateringMedia(params) {
  return publicAxios.get("/media/catering/", { params });
}

export function fetchMediaHostingMedia(params) {
  return publicAxios.get("/media/media-hosting/", { params });
}

export function fetchPartnerVendorDashboardMedia(params) {
  return publicAxios.get("/media/partner-vendor-dashboard/", { params });
}

/**
 * ----------------------
 *  Debug
 * ----------------------
 */
export function fetchDebugProto() {
  return publicAxios.get("/media/debug/proto/");
}

export default {
  // Admin
  uploadMedia,
  fetchAllMedia,
  updateMedia,
  toggleActive,
  toggleFeatured,
  deleteMedia,
  restoreMedia,
  fetchArchivedMedia,
  reorderMedia,
  fetchMediaStats,
  // Public
  fetchMediaList,
  fetchBannerMedia,
  fetchFeaturedMedia,
  fetchVendorMedia,
  fetchPartnerMedia,
  fetchUserMedia,
  fetchHomeMedia,
  fetchAboutMedia,
  fetchDecorMedia,
  fetchLiveBandMedia,
  fetchCateringMedia,
  fetchMediaHostingMedia,
  fetchPartnerVendorDashboardMedia,
  fetchDebugProto,
};
