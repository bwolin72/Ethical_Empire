// src/api/services/publicBlogService.js
import publicAxios from "../publicAxios";

/**
 * -----------------------------------------------------
 * 📰 Public Blog API Service
 * For unauthenticated (read-only) endpoints
 * -----------------------------------------------------
 */

const BASE = `/blog`;

// Normalize array responses
const normalizeArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.results && Array.isArray(data.results)) return data.results;
  return [];
};

const PublicBlogService = {
  // --------------------------------------------------
  // 🗞️ POSTS
  // --------------------------------------------------

  async getAllPosts(params = {}) {
    const res = await publicAxios.get(`${BASE}/posts/articles/`, { params });
    return normalizeArray(res.data);
  },

  async getLatestPosts(limit = 5) {
    const res = await publicAxios.get(`${BASE}/posts/latest/`, { params: { limit } });
    return normalizeArray(res.data);
  },

  async getPostBySlug(slug) {
    if (!slug) return null;
    const res = await publicAxios.get(`${BASE}/posts/${slug}/`);
    return res.data || null;
  },

  // --------------------------------------------------
  // 💬 COMMENTS
  // --------------------------------------------------

  async getComments(slug) {
    if (!slug) return [];
    const res = await publicAxios.get(`${BASE}/posts/${slug}/comments/`);
    return normalizeArray(res.data);
  },

  async submitComment(slug, data) {
    if (!slug || !data) return null;
    const res = await publicAxios.post(`${BASE}/posts/${slug}/comments/`, data);
    return res.data || null;
  },

  // --------------------------------------------------
  // 🗂️ CATEGORIES
  // --------------------------------------------------

  async getCategories() {
    const res = await publicAxios.get(`${BASE}/categories/`);
    return normalizeArray(res.data);
  },

  // --------------------------------------------------
  // 📣 SOCIAL POSTS
  // --------------------------------------------------

  // Fetch latest social posts (main endpoint)
  async getLatestSocialPosts(limit = 10) {
    try {
      const res = await publicAxios.get(`${BASE}/social-posts/latest/`, { params: { limit } });
      return normalizeArray(res.data);
    } catch (err) {
      console.warn("[PublicBlogService] Failed to fetch latest social posts:", err.message);
      return [];
    }
  },

  // Fetch legacy public feed (backward compatibility)
  async getLegacySocialFeed(limit = 10) {
    try {
      const res = await publicAxios.get(`${BASE}/social/public-feed/`, { params: { limit } });
      return normalizeArray(res.data);
    } catch (err) {
      console.warn("[PublicBlogService] Legacy public feed unavailable:", err.message);
      return [];
    }
  },
};

export default PublicBlogService;
