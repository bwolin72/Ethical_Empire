// src/services/PublicBlogService.js
import publicAxios from "../publicAxios";

/**
 * -----------------------------------------------------
 * 📰 Public Blog API Service
 * For unauthenticated (read-only) endpoints
 * -----------------------------------------------------
 */

const BASE = `/api/blog`;

// Helper to normalize paginated or array responses
const normalizeArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.results && Array.isArray(data.results)) return data.results;
  return [];
};

export const PublicBlogService = {
  // --------------------------------------------------
  // 🗞️ POSTS
  // --------------------------------------------------

  /**
   * Fetch all published blog posts
   * GET /api/blog/posts/articles/
   */
  async getAllPosts(params = {}) {
    const res = await publicAxios.get(`${BASE}/posts/articles/`, { params });
    return normalizeArray(res.data);
  },

  /**
   * Fetch the latest published posts
   * GET /api/blog/posts/latest/
   */
  async getLatestPosts(limit = 5) {
    const res = await publicAxios.get(`${BASE}/posts/latest/`, { params: { limit } });
    return normalizeArray(res.data);
  },

  /**
   * Fetch a single post by slug
   * GET /api/blog/posts/{slug}/
   */
  async getPostBySlug(slug) {
    if (!slug) return null;
    const res = await publicAxios.get(`${BASE}/posts/${slug}/`);
    return res.data || null;
  },

  // --------------------------------------------------
  // 💬 COMMENTS
  // --------------------------------------------------

  /**
   * Fetch approved comments for a given post
   * GET /api/blog/posts/{slug}/comments/
   */
  async getComments(slug) {
    if (!slug) return [];
    const res = await publicAxios.get(`${BASE}/posts/${slug}/comments/`);
    return normalizeArray(res.data);
  },

  /**
   * Submit a new comment (guest or user)
   * POST /api/blog/posts/{slug}/comments/
   */
  async submitComment(slug, data) {
    if (!slug || !data) return null;
    const res = await publicAxios.post(`${BASE}/posts/${slug}/comments/`, data);
    return res.data || null;
  },

  // --------------------------------------------------
  // 🗂️ CATEGORIES
  // --------------------------------------------------

  /**
   * Fetch all published blog categories
   * GET /api/blog/categories/
   */
  async getCategories() {
    const res = await publicAxios.get(`${BASE}/categories/`);
    return normalizeArray(res.data);
  },

  // --------------------------------------------------
  // 📣 SOCIAL POSTS (Public Feed)
  // --------------------------------------------------

  /**
   * Fetch latest public social posts
   * GET /api/blog/social-posts/latest/
   */
  async getLatestSocialPosts(limit = 10) {
    try {
      const res = await publicAxios.get(`${BASE}/social-posts/latest/`, { params: { limit } });
      return normalizeArray(res.data);
    } catch (err) {
      console.warn("[PublicBlogService] Failed to fetch latest social posts:", err.message);
      return [];
    }
  },

  /**
   * Fetch public social feed (aggregated)
   * GET /api/blog/social-posts/public-feed/
   */
  async getPublicFeed(limit = 10) {
    try {
      const res = await publicAxios.get(`${BASE}/social-posts/public-feed/`, { params: { limit } });
      return normalizeArray(res.data);
    } catch (err) {
      console.warn("[PublicBlogService] Public feed unavailable:", err.message);
      return [];
    }
  },
};

export default PublicBlogService;
