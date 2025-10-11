// frontend/src/services/PublicBlogService.js

import axios from "axios";

// Adjust base URL as appropriate for your environment
// Example: https://yourdomain.com/api
const baseURL = process.env.REACT_APP_API_URL || "/api";

// Shared Axios instance for public (unauthenticated) requests
export const publicAxios = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// -------------------------------------------
// Blog API (Public endpoints)
// -------------------------------------------
export const PublicBlogService = {
  // Fetch latest published posts
  async getLatestPosts(limit = 5) {
    const res = await publicAxios.get(`/blog/posts/latest/`, {
      params: { limit },
    });
    return res.data;
  },

  // Fetch all published posts
  async getAllPosts() {
    const res = await publicAxios.get(`/blog/posts/articles/`);
    return res.data;
  },

  // Fetch a specific post by slug
  async getPostBySlug(slug) {
    const res = await publicAxios.get(`/blog/posts/${slug}/`);
    return res.data;
  },

  // Fetch approved comments for a post
  async getComments(slug) {
    const res = await publicAxios.get(`/blog/posts/${slug}/comments/`);
    return res.data;
  },

  // Submit a new comment (guest or user)
  async submitComment(slug, data) {
    const res = await publicAxios.post(`/blog/posts/${slug}/comments/`, data);
    return res.data;
  },

  // -------------------------------------------
  // Social Feed (Matches Django routes exactly)
  // -------------------------------------------

  /**
   * Fetch live social media posts (public feed)
   * Uses `/api/blog/social-posts/public-feed/`
   * which maps to: `SocialPostViewSet.public_feed_alias`
   */
  async getSocialPosts(limit = 10) {
    try {
      const res = await publicAxios.get(`/blog/social-posts/public-feed/`, {
        params: { limit },
      });
      return res.data;
    } catch (err) {
      console.warn("[PublicBlogService] Social posts unavailable:", err.message);
      return [];
    }
  },
};

export default PublicBlogService;
