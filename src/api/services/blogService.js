// src/api/services/blogService.js
import axiosInstance from "../axiosInstance";
import publicAxios from "../publicAxios";
import baseURL from "../baseURL";

const BASE = `${baseURL}/blog`;

// Normalize pagination responses
const normalizeArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.results && Array.isArray(data.results)) return data.results;
  return [];
};

// ---------------------------------------------------
// 📰 POSTS
// ---------------------------------------------------
export const getPosts = async (params = {}) => {
  const res = await publicAxios.get(`${BASE}/posts/`, { params });
  return normalizeArray(res.data);
};

export const getPostDetail = async (slug) => {
  if (!slug) return null;
  const res = await publicAxios.get(`${BASE}/posts/${slug}/`);
  return res.data || null;
};

export const getLatestPosts = async () => {
  const res = await publicAxios.get(`${BASE}/posts/latest/`);
  return normalizeArray(res.data);
};

export const getAllArticles = async () => {
  const res = await publicAxios.get(`${BASE}/posts/articles/`);
  return normalizeArray(res.data);
};

// Admin-only
export const createPost = (data) => axiosInstance.post(`${BASE}/posts/`, data);
export const updatePost = (slug, data) => axiosInstance.put(`${BASE}/posts/${slug}/`, data);
export const deletePost = (slug) => axiosInstance.delete(`${BASE}/posts/${slug}/`);
export const syncSocialPost = (slug) => axiosInstance.post(`${BASE}/posts/${slug}/sync-social/`);

// ---------------------------------------------------
// 💬 COMMENTS
// ---------------------------------------------------
export const getComments = async (slug) => {
  if (!slug) return [];
  const res = await publicAxios.get(`${BASE}/posts/${slug}/comments/`);
  return normalizeArray(res.data);
};

export const addComment = (slug, data) =>
  publicAxios.post(`${BASE}/posts/${slug}/comments/`, data);

// ---------------------------------------------------
// 🗂️ CATEGORIES
// ---------------------------------------------------
export const getCategories = async () => {
  const res = await publicAxios.get(`${BASE}/categories/`);
  return normalizeArray(res.data);
};

export const createCategory = (data) => axiosInstance.post(`${BASE}/categories/`, data);
export const updateCategory = (slug, data) => axiosInstance.put(`${BASE}/categories/${slug}/`, data);
export const deleteCategory = (slug) => axiosInstance.delete(`${BASE}/categories/${slug}/`);

// ---------------------------------------------------
// 🌐 SOCIAL
// ---------------------------------------------------

// Admin social accounts
export const getSocialAccounts = () => axiosInstance.get(`${BASE}/social-accounts/`);
export const createSocialAccount = (data) => axiosInstance.post(`${BASE}/social-accounts/`, data);
export const updateSocialAccount = (id, data) =>
  axiosInstance.put(`${BASE}/social-accounts/${id}/`, data);
export const deleteSocialAccount = (id) => axiosInstance.delete(`${BASE}/social-accounts/${id}/`);

// Admin + public social posts
export const getSocialPosts = () => axiosInstance.get(`${BASE}/social-posts/`);
export const getSocialPostDetail = (id) => axiosInstance.get(`${BASE}/social-posts/${id}/`);
export const getLatestSocialPosts = (limit = 10) =>
  publicAxios.get(`${BASE}/social-posts/latest/`, { params: { limit } });
export const getPublicFeed = (limit = 10) =>
  publicAxios.get(`${BASE}/social-posts/public-feed/`, { params: { limit } });
export const refreshSocialPosts = () => axiosInstance.post(`${BASE}/social-posts/refresh/`);

// ---------------------------------------------------
// 📦 EXPORTS
// ---------------------------------------------------
export default {
  getPosts,
  getPostDetail,
  getLatestPosts,
  getAllArticles,
  createPost,
  updatePost,
  deletePost,
  syncSocialPost,

  getComments,
  addComment,

  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,

  getSocialAccounts,
  createSocialAccount,
  updateSocialAccount,
  deleteSocialAccount,

  getSocialPosts,
  getSocialPostDetail,
  getLatestSocialPosts,
  getPublicFeed,
  refreshSocialPosts,
};
