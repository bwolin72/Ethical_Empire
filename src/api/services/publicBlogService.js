// src/api/services/publicBlogService.js
import publicAxios from "../publicAxios";
import baseURL from "../baseURL";

const API_URL = `${baseURL}/blog`;

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
// POSTS (Public)
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

export const getLatestPosts = async () => {
  const res = await publicAxios.get(`${API_URL}/posts/latest/`);
  return normalizeArray(res.data);
};

export const getAllArticles = async () => {
  const res = await publicAxios.get(`${API_URL}/posts/articles/`);
  return normalizeArray(res.data);
};

// -------------------------
// COMMENTS (Public)
// -------------------------
export const getComments = async (slug) => {
  if (!slug || slug === "latest" || slug === "articles") return [];
  const res = await publicAxios.get(`${API_URL}/posts/${slug}/comments/`);
  return normalizeArray(res.data);
};

export const addComment = async (slug, data) => {
  if (!slug || !data) return null;
  const res = await publicAxios.post(`${API_URL}/posts/${slug}/comments/`, data);
  return res.data || null;
};

// -------------------------
// CATEGORIES (Public)
// -------------------------
export const getCategories = async () => {
  const res = await publicAxios.get(`${API_URL}/categories/`);
  return normalizeArray(res.data);
};

// -------------------------
// SOCIAL POSTS (Public)
// -------------------------
export const getSocialPosts = async (limit = 10) => {
  try {
    // ✅ Adjusted endpoint (was /blog/social-posts/latest/)
    const res = await publicAxios.get(`${baseURL}/social/public-feed/`, {
      params: { limit },
    });
    return normalizeArray(res.data);
  } catch (err) {
    console.warn("[PublicBlogService] Social posts unavailable:", err.message);
    return [];
  }
};

// -------------------------
// Export all
// -------------------------
export default {
  getPosts,
  getPostDetail,
  getLatestPosts,
  getAllArticles,
  getComments,
  addComment,
  getCategories,
  getSocialPosts,
};

