// src/api/services/blogService.js
import axiosInstance from "../axiosInstance";
import publicAxios from "../publicAxios";
import baseURL from "../baseURL";

const API_URL = `${baseURL}/blog`;

/* 🧩 PRO TIP:
   This service is synced with the Django REST API backend.
   - Auth required for admin endpoints (axiosInstance)
   - Public endpoints use publicAxios
   - Handles Posts, Categories, Comments, Social Sync, and Accounts
*/

// -------------------------
// Helper to normalize paginated or raw arrays
// -------------------------
const normalizeArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.results && Array.isArray(data.results)) return data.results;
  return [];
};

// -------------------------
// POSTS (Public + Admin)
// -------------------------
export const getPosts = async (params = {}) => {
  const res = await publicAxios.get(`${API_URL}/posts/`, { params });
  return normalizeArray(res.data);
};

export const getPostDetail = async (slug) => {
  if (!slug) return null;
  const res = await publicAxios.get(`${API_URL}/posts/${slug}/`);
  return res.data || null;
};

// Admin CRUD
export const createPost = (data) =>
  axiosInstance.post(`${API_URL}/posts/`, data).then((res) => res.data);

export const updatePost = (slug, data) =>
  axiosInstance.put(`${API_URL}/posts/${slug}/`, data).then((res) => res.data);

export const deletePost = (slug) =>
  axiosInstance.delete(`${API_URL}/posts/${slug}/`).then((res) => res.data);

// -------------------------
// COMMENTS (Public + Admin)
// -------------------------
export const getComments = async (slug) => {
  if (!slug || slug === "latest" || slug === "articles") return [];
  const res = await publicAxios.get(`${API_URL}/posts/${slug}/comments/`);
  return normalizeArray(res.data);
};

export const addComment = async (slug, data) => {
  const res = await publicAxios.post(`${API_URL}/posts/${slug}/comments/`, data);
  return res.data || null;
};

// Admin comment moderation
export const updateComment = async (id, data) => {
  const res = await axiosInstance.patch(`${API_URL}/comments/${id}/`, data);
  return res.data;
};

export const deleteComment = async (id) => {
  const res = await axiosInstance.delete(`${API_URL}/comments/${id}/`);
  return res.data;
};

// -------------------------
// SOCIAL SYNC (Admin Only)
// -------------------------
export const syncSocialPost = async (slug) => {
  const res = await axiosInstance.post(`${API_URL}/posts/${slug}/sync-social/`);
  return res.data;
};

// -------------------------
// CATEGORIES (Public + Admin)
// -------------------------
export const getCategories = async () => {
  const res = await publicAxios.get(`${API_URL}/categories/`);
  return normalizeArray(res.data);
};

// Admin category actions
export const createCategory = (data) =>
  axiosInstance.post(`${API_URL}/categories/`, data).then((res) => res.data);

export const updateCategory = (slug, data) =>
  axiosInstance.put(`${API_URL}/categories/${slug}/`, data).then((res) => res.data);

export const deleteCategory = (slug) =>
  axiosInstance.delete(`${API_URL}/categories/${slug}/`).then((res) => res.data);

// -------------------------
// SOCIAL ACCOUNTS (Admin Only)
// -------------------------
export const getSocialAccounts = () =>
  axiosInstance.get(`${API_URL}/social-accounts/`).then((res) => res.data);

export const createSocialAccount = (data) =>
  axiosInstance.post(`${API_URL}/social-accounts/`, data).then((res) => res.data);

export const updateSocialAccount = (id, data) =>
  axiosInstance.put(`${API_URL}/social-accounts/${id}/`, data).then((res) => res.data);

export const deleteSocialAccount = (id) =>
  axiosInstance.delete(`${API_URL}/social-accounts/${id}/`).then((res) => res.data);

// -------------------------
// SOCIAL POSTS (Read-only Admin)
// -------------------------
export const getSocialPosts = () =>
  axiosInstance.get(`${API_URL}/social-posts/`).then((res) => res.data);

// -------------------------
// Export all
// -------------------------
export default {
  // Posts
  getPosts,
  getPostDetail,
  createPost,
  updatePost,
  deletePost,

  // Comments
  getComments,
  addComment,
  updateComment,
  deleteComment,

  // Social
  syncSocialPost,
  getSocialPosts,

  // Categories
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,

  // Social Accounts
  getSocialAccounts,
  createSocialAccount,
  updateSocialAccount,
  deleteSocialAccount,
};
