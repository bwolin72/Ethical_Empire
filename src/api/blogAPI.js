// src/api/blogAPI.js
import axiosInstance from "./axiosInstance";
import publicAxios from "./publicAxios";
import baseURL from "./baseURL";

const BASE = `${baseURL}/blog`;

// Helper to normalize paginated data or arrays
const normalizeArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.results && Array.isArray(data.results)) return data.results;
  return [];
};

// -------------------------------
// 📰 POSTS
// -------------------------------
export const fetchPosts = async (params = {}) => {
  const res = await publicAxios.get(`${BASE}/posts/`, { params });
  return normalizeArray(res.data);
};

export const fetchPostDetail = async (slug) => {
  if (!slug) return null;
  const res = await publicAxios.get(`${BASE}/posts/${slug}/`);
  return res.data || null;
};

export const fetchLatestPosts = async () => {
  const res = await publicAxios.get(`${BASE}/posts/latest/`);
  return normalizeArray(res.data);
};

export const fetchAllArticles = async () => {
  const res = await publicAxios.get(`${BASE}/posts/articles/`);
  return normalizeArray(res.data);
};

// Admin CRUD
export const createPost = (data) =>
  axiosInstance.post(`${BASE}/posts/`, data).then((res) => res.data);

export const updatePost = (slug, data) =>
  axiosInstance.put(`${BASE}/posts/${slug}/`, data).then((res) => res.data);

export const deletePost = (slug) =>
  axiosInstance.delete(`${BASE}/posts/${slug}/`).then((res) => res.data);

export const syncSocialPost = (slug) =>
  axiosInstance.post(`${BASE}/posts/${slug}/sync-social/`).then((res) => res.data);

// -------------------------------
// 💬 COMMENTS
// -------------------------------
export const fetchComments = async (slug) => {
  if (!slug) return [];
  const res = await publicAxios.get(`${BASE}/posts/${slug}/comments/`);
  return normalizeArray(res.data);
};

export const createComment = async (slug, data) => {
  if (!slug || !data) return null;
  const res = await publicAxios.post(`${BASE}/posts/${slug}/comments/`, data);
  return res.data || null;
};

// -------------------------------
// 🗂️ CATEGORIES
// -------------------------------
export const fetchCategories = async () => {
  const res = await publicAxios.get(`${BASE}/categories/`);
  return normalizeArray(res.data);
};

export const createCategory = (data) =>
  axiosInstance.post(`${BASE}/categories/`, data).then((res) => res.data);

export const updateCategory = (slug, data) =>
  axiosInstance.put(`${BASE}/categories/${slug}/`, data).then((res) => res.data);

export const deleteCategory = (slug) =>
  axiosInstance.delete(`${BASE}/categories/${slug}/`).then((res) => res.data);

// -------------------------------
// 🌐 SOCIAL ACCOUNTS
// -------------------------------
export const fetchSocialAccounts = () =>
  axiosInstance.get(`${BASE}/social-accounts/`).then((res) => res.data);

export const createSocialAccount = (data) =>
  axiosInstance.post(`${BASE}/social-accounts/`, data).then((res) => res.data);

export const updateSocialAccount = (id, data) =>
  axiosInstance.put(`${BASE}/social-accounts/${id}/`, data).then((res) => res.data);

export const deleteSocialAccount = (id) =>
  axiosInstance.delete(`${BASE}/social-accounts/${id}/`).then((res) => res.data);

// -------------------------------
// 📣 SOCIAL POSTS
// -------------------------------
export const fetchSocialPosts = () =>
  axiosInstance.get(`${BASE}/social-posts/`).then((res) => res.data);

export const fetchSocialPostDetail = (id) =>
  axiosInstance.get(`${BASE}/social-posts/${id}/`).then((res) => res.data);

export const fetchLatestSocialPosts = (limit = 10) =>
  publicAxios
    .get(`${BASE}/social-posts/latest/`, { params: { limit } })
    .then((res) => normalizeArray(res.data));

export const fetchPublicFeed = (limit = 10) =>
  publicAxios
    .get(`${BASE}/social-posts/public-feed/`, { params: { limit } })
    .then((res) => normalizeArray(res.data));

export const refreshSocialPosts = () =>
  axiosInstance.post(`${BASE}/social-posts/refresh/`).then((res) => res.data);

// -------------------------------
// EXPORT ALL
// -------------------------------
export default {
  // Posts
  fetchPosts,
  fetchPostDetail,
  fetchLatestPosts,
  fetchAllArticles,
  createPost,
  updatePost,
  deletePost,
  syncSocialPost,

  // Comments
  fetchComments,
  createComment,

  // Categories
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,

  // Social Accounts
  fetchSocialAccounts,
  createSocialAccount,
  updateSocialAccount,
  deleteSocialAccount,

  // Social Posts
  fetchSocialPosts,
  fetchSocialPostDetail,
  fetchLatestSocialPosts,
  fetchPublicFeed,
  refreshSocialPosts,
};
