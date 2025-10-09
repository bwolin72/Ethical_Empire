// src/api/blogAPI.js
import axiosInstance from "../axiosInstance";
import baseURL from "../baseURL";

// Create an axios instance for the blog API
const blogAPI = axiosInstance.create({
  baseURL: `${baseURL}/blog`,
});

// -------------------------
// Helper to normalize paginated or raw arrays
// -------------------------
const normalizeArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.results && Array.isArray(data.results)) return data.results;
  return [];
};

// ==========================
// POSTS
// ==========================
export const fetchPosts = async (params = {}) => {
  const res = await blogAPI.get("/posts/", { params });
  return normalizeArray(res.data);
};

export const fetchPostDetail = async (slug) => {
  if (!slug) return null;
  const res = await blogAPI.get(`/posts/${slug}/`);
  return res.data || null;
};

// Latest 5 posts (for frontend widgets)
export const fetchLatestPosts = async () => {
  const res = await blogAPI.get("/posts/latest/");
  return normalizeArray(res.data);
};

// All published articles
export const fetchAllArticles = async () => {
  const res = await blogAPI.get("/posts/articles/");
  return normalizeArray(res.data);
};

// Admin CRUD
export const createPost = (data) =>
  blogAPI.post("/posts/", data).then((res) => res.data);

export const updatePost = (slug, data) =>
  blogAPI.put(`/posts/${slug}/`, data).then((res) => res.data);

export const deletePost = (slug) =>
  blogAPI.delete(`/posts/${slug}/`).then((res) => res.data);

// Trigger background social posting for a blog post (Admin only)
export const syncSocialPost = (slug) =>
  blogAPI.post(`/posts/${slug}/sync-social/`).then((res) => res.data);

// ==========================
// COMMENTS
// ==========================
export const fetchComments = async (slug) => {
  if (!slug || slug === "latest" || slug === "articles") return [];
  const res = await blogAPI.get(`/posts/${slug}/comments/`);
  return normalizeArray(res.data);
};

export const createComment = async (slug, data) => {
  if (!slug || !data) return null;
  const res = await blogAPI.post(`/posts/${slug}/comments/`, data);
  return res.data || null;
};

// ==========================
// CATEGORIES
// ==========================
export const fetchCategories = async () => {
  const res = await blogAPI.get("/categories/");
  return normalizeArray(res.data);
};

export const createCategory = (data) =>
  blogAPI.post("/categories/", data).then((res) => res.data);

export const updateCategory = (slug, data) =>
  blogAPI.put(`/categories/${slug}/`, data).then((res) => res.data);

export const deleteCategory = (slug) =>
  blogAPI.delete(`/categories/${slug}/`).then((res) => res.data);

// ==========================
// SOCIAL ACCOUNTS
// ==========================
export const fetchSocialAccounts = () =>
  blogAPI.get("/social-accounts/").then((res) => res.data);

export const createSocialAccount = (data) =>
  blogAPI.post("/social-accounts/", data).then((res) => res.data);

export const updateSocialAccount = (id, data) =>
  blogAPI.put(`/social-accounts/${id}/`, data).then((res) => res.data);

export const deleteSocialAccount = (id) =>
  blogAPI.delete(`/social-accounts/${id}/`).then((res) => res.data);

// ==========================
// SOCIAL POSTS
// ==========================
// Fetch social posts (admin list)
export const fetchSocialPosts = () =>
  blogAPI.get("/social-posts/").then((res) => res.data);

// Fetch latest from platforms (public feed)
export const fetchLatestSocialPosts = (limit = 10) =>
  blogAPI
    .get("/social-posts/latest/", { params: { limit } })
    .then((res) => normalizeArray(res.data));

// ==========================
// EXPORT ALL
// ==========================
export default {
  // Posts
  fetchPosts,
  fetchPostDetail,
  fetchLatestPosts,
  fetchAllArticles,
  createPost,
  updatePost,
  deletePost,
  syncSocialPost,

  // Comments
  fetchComments,
  createComment,

  // Categories
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,

  // Social Accounts
  fetchSocialAccounts,
  createSocialAccount,
  updateSocialAccount,
  deleteSocialAccount,

  // Social Posts
  fetchSocialPosts,
  fetchLatestSocialPosts,
};
