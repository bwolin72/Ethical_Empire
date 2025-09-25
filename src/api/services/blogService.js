// src/api/services/blogService.js
import axiosInstance from "../axiosInstance";
import baseURL from "../baseURL";

// Base Axios instance for blog endpoints
const blogAPI = axiosInstance.create({
  baseURL: `${baseURL}/blog`,
});

// ===== POSTS =====
const getPosts = (params = {}) =>
  blogAPI.get("/posts/", { params }).then((res) => res.data);

const getPostDetail = (slug) =>
  blogAPI.get(`/posts/${slug}/`).then((res) => res.data);

const createPost = (data, token) =>
  blogAPI.post("/posts/", data, {
    headers: { Authorization: `Token ${token}` },
  });

const updatePost = (slug, data, token) =>
  blogAPI.put(`/posts/${slug}/`, data, {
    headers: { Authorization: `Token ${token}` },
  });

const deletePost = (slug, token) =>
  blogAPI.delete(`/posts/${slug}/`, {
    headers: { Authorization: `Token ${token}` },
  });

// ===== COMMENTS =====
const getComments = (slug) =>
  blogAPI.get(`/posts/${slug}/comments/`).then((res) => res.data);

const addComment = (slug, data) =>
  blogAPI.post(`/posts/${slug}/comments/`, data).then((res) => res.data);

// ===== CATEGORIES =====
const getCategories = () =>
  blogAPI.get("/categories/").then((res) => res.data);

const createCategory = (data, token) =>
  blogAPI.post("/categories/", data, {
    headers: { Authorization: `Token ${token}` },
  });

const updateCategory = (slug, data, token) =>
  blogAPI.put(`/categories/${slug}/`, data, {
    headers: { Authorization: `Token ${token}` },
  });

const deleteCategory = (slug, token) =>
  blogAPI.delete(`/categories/${slug}/`, {
    headers: { Authorization: `Token ${token}` },
  });

// Aggregate all methods under a single service object
const BlogService = {
  getPosts,
  getPostDetail,
  getComments,
  addComment,
  getCategories,
  createPost,
  updatePost,
  deletePost,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default BlogService;
