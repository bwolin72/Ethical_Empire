// src/services/PublicBlogService.js

import publicAxios from "../publicAxios";

// -------------------------------------------
// Blog API (Public endpoints)
// -------------------------------------------
export const PublicBlogService = {
  /**
   * Fetch latest published blog posts
   * GET /api/blog/posts/latest/
   */
  async getLatestPosts(limit = 5) {
    const res = await publicAxios.get(`/blog/posts/latest/`, { params: { limit } });
    return res.data;
  },

  /**
   * Fetch all published blog posts
   * GET /api/blog/posts/articles/
   */
  async getAllPosts() {
    const res = await publicAxios.get(`/blog/posts/articles/`);
    return res.data;
  },

  /**
   * Fetch a single post by slug
   * GET /api/blog/posts/{slug}/
   */
  async getPostBySlug(slug) {
    const res = await publicAxios.get(`/blog/posts/${slug}/`);
    return res.data;
  },

  /**
   * Fetch approved comments for a post
   * GET /api/blog/posts/{slug}/comments/
   */
  async getComments(slug) {
    const res = await publicAxios.get(`/blog/posts/${slug}/comments/`);
    return res.data;
  },

  /**
   * Submit a new comment (guest or user)
   * POST /api/blog/posts/{slug}/comments/
   */
  async submitComment(slug, data) {
    const res = await publicAxios.post(`/blog/posts/${slug}/comments/`, data);
    return res.data;
  },

  /**
   * Fetch all blog categories
   * GET /api/blog-categories/
   */
  async getCategories() {
    const res = await publicAxios.get(`/blog-categories/`);
    return res.data;
  },

  // ------------------------------------------------------
  // 🧩 SOCIAL FEED (Legacy Alias Supported)
  // ------------------------------------------------------

  /**
   * Fetch live social media posts (public feed)
   * Uses /api/blog/social/public-feed/
   */
  async getSocialPosts(limit = 10) {
    try {
      const res = await publicAxios.get(`/blog/social/public-feed/`, { params: { limit } });
      return res.data;
    } catch (err) {
      console.warn("[PublicBlogService] Social posts unavailable:", err.message);
      return [];
    }
  },
};

export default PublicBlogService;
