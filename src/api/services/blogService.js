// src/services/blogService.js
import * as api from "../blogAPI";

/**
 * Blog Service wraps API calls and adds additional logic if needed.
 */

const BlogService = {
  // POSTS
  getPosts: async (params = {}) => {
    try {
      const posts = await api.fetchPosts(params);
      // Example: format publish_date
      return posts.map((p) => ({
        ...p,
        publish_date: p.publish_date ? new Date(p.publish_date) : null,
      }));
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  },

  getPostDetail: async (slug) => {
    try {
      const post = await api.fetchPostDetail(slug);
      return post;
    } catch (error) {
      console.error("Error fetching post detail:", error);
      throw error;
    }
  },

  createPost: async (data, token) => {
    return api.createPost(data, token);
  },

  updatePost: async (slug, data, token) => {
    return api.updatePost(slug, data, token);
  },

  deletePost: async (slug, token) => {
    return api.deletePost(slug, token);
  },

  // COMMENTS
  getComments: async (slug) => {
    return api.fetchComments(slug);
  },

  addComment: async (slug, data) => {
    return api.createComment(slug, data);
  },

  // CATEGORIES
  getCategories: async () => {
    return api.fetchCategories();
  },

  addCategory: async (data, token) => {
    return api.createCategory(data, token);
  },

  updateCategory: async (slug, data, token) => {
    return api.updateCategory(slug, data, token);
  },

  deleteCategory: async (slug, token) => {
    return api.deleteCategory(slug, token);
  },
};

export default BlogService;