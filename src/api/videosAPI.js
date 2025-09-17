// videosAPI.js
// Low-level HTTP calls for the Video API using the existing axios helpers.

import axiosInstance from "./axiosInstance";
import publicAxios from "./publicAxios";
import { handleRequest } from "./axiosCommon"; // assumes axiosCommon exports a handleRequest or similar

/*
  — axiosInstance  → for authenticated requests (requires token)
  — publicAxios    → for public endpoints
  — handleRequest  → shared error/response wrapper
*/

export const videosAPI = {
  // --------- CRUD (protected) ---------
  list: (params = {}) => handleRequest(publicAxios.get("videos/", { params })), // listing is public
  retrieve: (id) => handleRequest(publicAxios.get(`videos/${id}/`)),
  create: (payload) => handleRequest(axiosInstance.post("videos/", payload)),
  update: (id, payload) => handleRequest(axiosInstance.put(`videos/${id}/`, payload)),
  partialUpdate: (id, payload) => handleRequest(axiosInstance.patch(`videos/${id}/`, payload)),
  delete: (id) => handleRequest(axiosInstance.delete(`videos/${id}/`)),

  // --------- Toggle actions (protected) ---------
  toggleActive: (id) => handleRequest(axiosInstance.post(`videos/${id}/toggle_active/`)),
  toggleFeatured: (id) => handleRequest(axiosInstance.post(`videos/${id}/toggle_featured/`)),

  // --------- Public endpoint-specific lists ---------
  home: () => handleRequest(publicAxios.get("videos/home/")),
  about: () => handleRequest(publicAxios.get("videos/about/")),
  decor: () => handleRequest(publicAxios.get("videos/decor/")),
  liveBand: () => handleRequest(publicAxios.get("videos/live_band/")),
  catering: () => handleRequest(publicAxios.get("videos/catering/")),
  mediaHosting: () => handleRequest(publicAxios.get("videos/media_hosting/")),
  user: () => handleRequest(publicAxios.get("videos/user/")),
  vendor: () => handleRequest(publicAxios.get("videos/vendor/")),
  partner: () => handleRequest(publicAxios.get("videos/partner/")),
  partnerDashboard: () => handleRequest(publicAxios.get("videos/partner_dashboard/")),
  agencyDashboard: () => handleRequest(publicAxios.get("videos/agency_dashboard/")),
};

export default videosAPI;
