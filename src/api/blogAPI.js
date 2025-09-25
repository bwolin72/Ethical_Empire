// src/services/blogAPI.js
import axiosInstance from "../api/axiosInstance";
import baseURL from "../api/baseURL";

// Make sure blog endpoints always point to /blog
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

export default blogAPI;
