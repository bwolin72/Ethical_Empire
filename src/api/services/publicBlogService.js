// src/api/services/publicBlogService.js
import publicAxios from "../publicAxios";
import baseURL from "../baseURL";

// Base URL for blog endpoints
const API_URL = `${baseURL}/blog`;

// -------------------------
// Helper
// -------------------------
const normalizeArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.results && Array.isArray(data.results)) return data.results;
  return [];
};

// -------------------------
// POSTS
// -------------------------
export const getPosts = async (params = {}) => {
  const res = await publicAxios.get(`${API_URL}/posts/`, { params });
  return normalizeArray(res.data);
};

export const getPostDetail = async (slug) => {
  const res = await publicAxios.get(`${API_URL}/posts/${slug}/`);
  return res.data || null;
};

// Fetch latest 5 published posts
export const getLatestPosts = async () => {
  const res = await publicAxios.get(`${API_URL}/posts/latest/`);
  return normalizeArray(res.data);
};

// Fetch all published articles
export const getAllArticles = async () => {
  const res = await publicAxios.get(`${API_URL}/posts/articles/`);
  return normalizeArray(res.data);
};

// -------------------------
// COMMENTS
// -------------------------
export const getComments = async (slug) => {
  if (!slug || slug === "latest" || slug === "articles") return [];
  const res = await publicAxios.get(`${API_URL}/posts/${slug}/comments/`);
  return normalizeArray(res.data);
};

// -------------------------
// CATEGORIES
// -------------------------
export const getCategories = async () => {
  const res = await publicAxios.get(`${API_URL}/categories/`);
  return normalizeArray(res.data);
};

// -------------------------
// SOCIAL POSTS  ✅ NEW
// -------------------------
export const getSocialPosts = async () => {
  const res = await publicAxios.get(`${API_URL}/social-posts/`);
  return normalizeArray(res.data);
};

// -------------------------
export default {
  getPosts,
  getPostDetail,
  getLatestPosts,
  getAllArticles,
  getComments,
  getCategories,
  getSocialPosts, // ✅ Add this
};
