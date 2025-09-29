// src/api/services/blogService.js
import axiosInstance from "../axiosInstance";
import baseURL from "../baseURL";

// Axios instance for blog endpoints
const blogAPI = axiosInstance.create({
  baseURL: `${baseURL}/blog`, // Matches Django /blog/ prefix
});

// Utility to ensure response is always an array
const normalizeArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.results && Array.isArray(data.results)) return data.results;
  return [];
};

// ==========================
// POSTS
// ==========================
export const getPosts = async (params = {}) => {
  const res = await blogAPI.get("/posts/", { params });
  return normalizeArray(res.data);
};

export const getPostDetail = async (slug) => {
  const res = await blogAPI.get(`/posts/${slug}/`);
  return res.data || null;
};

export const createPost = (data, token) =>
  blogAPI.post("/posts/", data, {
    headers: { Authorization: `Token ${token}` },
  });

export const updatePost = (slug, data, token) =>
  blogAPI.put(`/posts/${slug}/`, data, {
    headers: { Authorization: `Token ${token}` },
  });

export const deletePost = (slug, token) =>
  blogAPI.delete(`/posts/${slug}/`, {
    headers: { Authorization: `Token ${token}` },
  });

// Trigger social sync for a post
export const syncPostSocial = (slug, token) =>
  blogAPI.post(`/posts/${slug}/sync-social/`, null, {
    headers: { Authorization: `Token ${token}` },
  });

// ==========================
// COMMENTS
// ==========================
export const getComments = async (slug) => {
  if (!slug || slug === "latest" || slug === "articles") return [];
  const res = await blogAPI.get(`/posts/${slug}/comments/`);
  return normalizeArray(res.data);
};

export const addComment = async (slug, data) => {
  if (!slug || slug === "latest" || slug === "articles") {
    return Promise.reject(
      new Error("Cannot add comment to list endpoints (latest/articles).")
    );
  }
  const res = await blogAPI.post(`/posts/${slug}/comments/`, data);
  return res.data || null;
};

// ==========================
// CATEGORIES
// ==========================
export const getCategories = async () => {
  const res = await blogAPI.get("/categories/");
  return normalizeArray(res.data);
};

export const createCategory = (data, token) =>
  blogAPI.post("/categories/", data, {
    headers: { Authorization: `Token ${token}` },
  });

export const updateCategory = (slug, data, token) =>
  blogAPI.put(`/categories/${slug}/`, data, {
    headers: { Authorization: `Token ${token}` },
  });

export const deleteCategory = (slug, token) =>
  blogAPI.delete(`/categories/${slug}/`, {
    headers: { Authorization: `Token ${token}` },
  });

// ==========================
// EXPORT AGGREGATE
// ==========================
const BlogService = {
  getPosts,
  getPostDetail,
  createPost,
  updatePost,
  deletePost,
  syncPostSocial,
  getComments,
  addComment,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default BlogService;
