// src/api/blogAPI.js
import axiosInstance from "../api/axiosInstance";
import baseURL from "../api/baseURL";

const blogAPI = axiosInstance.create({
  baseURL: `${baseURL}/blog`,
});

// ==========================
// POSTS
// ==========================
export const fetchPosts = (params = {}) =>
  blogAPI.get("/posts/", { params }).then((res) => res.data);

export const fetchPostDetail = (slug) =>
  blogAPI.get(`/posts/${slug}/`).then((res) => res.data);

export const createPost = (data) =>
  blogAPI.post("/posts/", data).then((res) => res.data);

export const updatePost = (slug, data) =>
  blogAPI.put(`/posts/${slug}/`, data).then((res) => res.data);

export const deletePost = (slug) =>
  blogAPI.delete(`/posts/${slug}/`).then((res) => res.data);

// ==========================
// COMMENTS
// ==========================
export const fetchComments = (slug) =>
  blogAPI.get(`/posts/${slug}/comments/`).then((res) => res.data);

export const createComment = (slug, data) =>
  blogAPI.post(`/posts/${slug}/comments/`, data).then((res) => res.data);

// ==========================
// CATEGORIES
// ==========================
export const fetchCategories = () =>
  blogAPI.get("/categories/").then((res) => res.data);

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
export const fetchSocialPosts = () =>
  blogAPI.get("/social-posts/").then((res) => res.data);

export default blogAPI;
