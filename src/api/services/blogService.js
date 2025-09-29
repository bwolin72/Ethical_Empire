import axiosInstance from "../axiosInstance";
import publicAxios from "../publicAxios";
import baseURL from "../baseURL";

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

// Admin CRUD
export const createPost = (data) =>
  axiosInstance.post(`${API_URL}/posts/`, data).then((res) => res.data);

export const updatePost = (slug, data) =>
  axiosInstance.put(`${API_URL}/posts/${slug}/`, data).then((res) => res.data);

export const deletePost = (slug) =>
  axiosInstance.delete(`${API_URL}/posts/${slug}/`).then((res) => res.data);

// -------------------------
// COMMENTS
// -------------------------
export const getComments = async (slug) => {
  if (!slug || slug === "latest" || slug === "articles") return [];
  const res = await publicAxios.get(`${API_URL}/posts/${slug}/comments/`);
  return normalizeArray(res.data);
};

export const addComment = async (slug, data) => {
  const res = await publicAxios.post(`${API_URL}/posts/${slug}/comments/`, data);
  return res.data || null;
};

// -------------------------
// SOCIAL SYNC (Admin Only)
// -------------------------
export const syncSocialPost = async (slug) => {
  const res = await axiosInstance.post(`${API_URL}/posts/${slug}/sync-social/`);
  return res.data;
};

// -------------------------
// CATEGORIES
// -------------------------
export const getCategories = async () => {
  const res = await publicAxios.get(`${API_URL}/categories/`);
  return normalizeArray(res.data);
};

// Admin category actions
export const createCategory = (data) =>
  axiosInstance.post(`${API_URL}/categories/`, data).then((res) => res.data);

export const updateCategory = (slug, data) =>
  axiosInstance.put(`${API_URL}/categories/${slug}/`, data).then((res) => res.data);

export const deleteCategory = (slug) =>
  axiosInstance.delete(`${API_URL}/categories/${slug}/`).then((res) => res.data);

// -------------------------
// SOCIAL ACCOUNTS (Admin Only)
// -------------------------
export const getSocialAccounts = () =>
  axiosInstance.get(`${API_URL}/social-accounts/`).then((res) => res.data);

export const createSocialAccount = (data) =>
  axiosInstance.post(`${API_URL}/social-accounts/`, data).then((res) => res.data);

export const updateSocialAccount = (id, data) =>
  axiosInstance.put(`${API_URL}/social-accounts/${id}/`, data).then((res) => res.data);

export const deleteSocialAccount = (id) =>
  axiosInstance.delete(`${API_URL}/social-accounts/${id}/`).then((res) => res.data);

// -------------------------
// SOCIAL POSTS (Read-only Admin)
// -------------------------
export const getSocialPosts = () =>
  axiosInstance.get(`${API_URL}/social-posts/`).then((res) => res.data);

export default {
  getPosts,
  getPostDetail,
  createPost,
  updatePost,
  deletePost,
  getComments,
  addComment,
  syncSocialPost,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getSocialAccounts,
  createSocialAccount,
  updateSocialAccount,
  deleteSocialAccount,
  getSocialPosts,
};
