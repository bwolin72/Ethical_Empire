// src/api/services/blogService.js
import axiosInstance from "../axiosInstance";
import baseURL from "../baseURL";

// Create Axios instance for blog endpoints
const blogAPI = axiosInstance.create({
  baseURL: `${baseURL}/blog`, // Matches Django /blog/ prefix
});

// ==========================
// POSTS - Public & Admin
// ==========================

// Get all posts (public: published only, admin: all)
export const getPosts = (params = {}) =>
  blogAPI.get("/posts/", { params }).then((res) => res.data);

// Get post detail by slug
export const getPostDetail = (slug) =>
  blogAPI.get(`/posts/${slug}/`).then((res) => res.data);

// Create a new post (admin)
export const createPost = (data, token) =>
  blogAPI.post("/posts/", data, {
    headers: { Authorization: `Token ${token}` },
  });

// Update post by slug (admin)
export const updatePost = (slug, data, token) =>
  blogAPI.put(`/posts/${slug}/`, data, {
    headers: { Authorization: `Token ${token}` },
  });

// Delete post by slug (admin)
export const deletePost = (slug, token) =>
  blogAPI.delete(`/posts/${slug}/`, {
    headers: { Authorization: `Token ${token}` },
  });

// ==========================
// COMMENTS - Public & Auth
// ==========================

// List approved comments for a post
export const getComments = (slug) => {
  if (!slug || slug === "latest" || slug === "articles") {
    // Prevent invalid requests for list endpoints
    return Promise.resolve([]);
  }
  return blogAPI.get(`/posts/${slug}/comments/`).then((res) => res.data);
};

// Add a comment to a post (public or authenticated)
export const addComment = (slug, data) => {
  if (!slug || slug === "latest" || slug === "articles") {
    return Promise.reject(
      new Error("Cannot add comment to list endpoints (latest/articles).")
    );
  }
  return blogAPI.post(`/posts/${slug}/comments/`, data).then((res) => res.data);
};

// ==========================
// CATEGORIES - Public & Admin
// ==========================

// List all categories
export const getCategories = () =>
  blogAPI.get("/categories/").then((res) => res.data);

// Create a new category (admin)
export const createCategory = (data, token) =>
  blogAPI.post("/categories/", data, {
    headers: { Authorization: `Token ${token}` },
  });

// Update category by slug (admin)
export const updateCategory = (slug, data, token) =>
  blogAPI.put(`/categories/${slug}/`, data, {
    headers: { Authorization: `Token ${token}` },
  });

// Delete category by slug (admin)
export const deleteCategory = (slug, token) =>
  blogAPI.delete(`/categories/${slug}/`, {
    headers: { Authorization: `Token ${token}` },
  });

// Aggregate all methods for easier imports
const BlogService = {
  // Posts
  getPosts,
  getPostDetail,
  createPost,
  updatePost,
  deletePost,
  // Comments
  getComments,
  addComment,
  // Categories
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default BlogService;
