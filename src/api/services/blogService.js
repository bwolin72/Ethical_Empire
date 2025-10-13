// src/api/services/blogService.js

import axiosInstance from "../axiosInstance";
import publicAxios from "../publicAxios";
import baseURL from "../baseURL";

const API_URL = `${baseURL}/blog`;

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
  const res = await publicAxios.get(`${API_URL}/posts/`, { params });
  return normalizeArray(res.data);
};

export const getPostDetail = async (slug) => {
  if (!slug) return null;
  const res = await publicAxios.get(`${API_URL}/posts/${slug}/`);
  return res.data || null;
};

// Admin-only
export const createPost = (data) => axiosInstance.post(`${API_URL}/posts/`, data);
export const updatePost = (slug, data) => axiosInstance.put(`${API_URL}/posts/${slug}/`, data);
export const deletePost = (slug) => axiosInstance.delete(`${API_URL}/posts/${slug}/`);

// ---------------------------------------------------
// 💬 COMMENTS
// ---------------------------------------------------
export const getComments = async (slug) => {
  if (!slug) return [];
  const res = await publicAxios.get(`${API_URL}/posts/${slug}/comments/`);
  return normalizeArray(res.data);
};

export const addComment = (slug, data) =>
  publicAxios.post(`${API_URL}/posts/${slug}/comments/`, data);

// ---------------------------------------------------
// 🗂️ CATEGORIES
// ---------------------------------------------------
export const getCategories = async () => {
  const res = await publicAxios.get(`${API_URL}/categories/`);
  return normalizeArray(res.data);
};

export const createCategory = (data) => axiosInstance.post(`${API_URL}/categories/`, data);
export const updateCategory = (slug, data) =>
  axiosInstance.put(`${API_URL}/categories/${slug}/`, data);
export const deleteCategory = (slug) =>
  axiosInstance.delete(`${API_URL}/categories/${slug}/`);

// ---------------------------------------------------
// 🌐 SOCIAL (Admin + Public)
// ---------------------------------------------------

// Public feed (legacy alias)
export const getSocialFeed = async (limit = 10) => {
  const res = await publicAxios.get(`${API_URL}/social/public-feed/`, { params: { limit } });
  return res.data;
};

// Admin management
export const getSocialAccounts = () => axiosInstance.get(`${API_URL}/social-accounts/`);
export const createSocialAccount = (data) =>
  axiosInstance.post(`${API_URL}/social-accounts/`, data);
export const updateSocialAccount = (id, data) =>
  axiosInstance.put(`${API_URL}/social-accounts/${id}/`, data);
export const deleteSocialAccount = (id) =>
  axiosInstance.delete(`${API_URL}/social-accounts/${id}/`);

export const getSocialPosts = () => axiosInstance.get(`${API_URL}/social-posts/`);
export const syncSocialPost = (slug) =>
  axiosInstance.post(`${API_URL}/posts/${slug}/sync-social/`);

// ---------------------------------------------------
// 📦 EXPORTS
// ---------------------------------------------------
export default {
  getPosts,
  getPostDetail,
  createPost,
  updatePost,
  deletePost,

  getComments,
  addComment,

  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,

  getSocialFeed,
  getSocialAccounts,
  createSocialAccount,
  updateSocialAccount,
  deleteSocialAccount,
  getSocialPosts,
  syncSocialPost,
};
