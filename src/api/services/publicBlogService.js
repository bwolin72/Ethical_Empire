// ======================================================
// 🌐 PublicBlogService
// For fetching published posts, categories & comments
// ======================================================
import publicAxios from "../publicAxios";
import baseURL from "../baseURL";

const API_URL = `${baseURL}/blog`;

// -----------------------------
// Helper: Normalize Data Shape
// -----------------------------
const normalizeArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.results && Array.isArray(data.results)) return data.results;
  return [];
};

// ======================================================
// 📰 BLOG POSTS
// ======================================================

// 🧭 All posts (paginated)
export const getPosts = async (params = {}) => {
  const res = await publicAxios.get(`${API_URL}/`, { params });
  return normalizeArray(res.data);
};

// 🧾 Post detail (by slug)
export const getPostDetail = async (slug) => {
  if (!slug) return null;
  const res = await publicAxios.get(`${API_URL}/${slug}/`);
  return res.data || null;
};

// 🆕 Latest posts (matches backend @action detail=False url_path="latest")
export const getLatestPosts = async () => {
  const res = await publicAxios.get(`${API_URL}/latest/`);
  return normalizeArray(res.data);
};

// 🗂️ All “article” posts (if you have them)
export const getAllArticles = async () => {
  const res = await publicAxios.get(`${API_URL}/articles/`);
  return normalizeArray(res.data);
};

// ======================================================
// 💬 COMMENTS
// ======================================================
export const getComments = async (slug) => {
  if (!slug) return [];
  const res = await publicAxios.get(`${API_URL}/${slug}/comments/`);
  return normalizeArray(res.data);
};

export const addComment = async (slug, data) => {
  if (!slug || !data) return null;
  const res = await publicAxios.post(`${API_URL}/${slug}/comments/`, data);
  return res.data || null;
};

// ======================================================
// 🏷️ CATEGORIES
// ======================================================
export const getCategories = async () => {
  const res = await publicAxios.get(`${baseURL}/categories/`);
  return normalizeArray(res.data);
};

// ======================================================
// 🌐 SOCIAL POSTS (for SocialHub)
// ======================================================
export const getSocialPosts = async (limit = 10) => {
  try {
    const res = await publicAxios.get(`${baseURL}/social/public-feed/`, {
      params: { limit },
    });
    return normalizeArray(res.data);
  } catch (err) {
    console.warn("[PublicBlogService] Social posts unavailable:", err.message);
    return [];
  }
};

// ======================================================
// 🧱 EXPORT
// ======================================================
const PublicBlogService = {
  getPosts,
  getPostDetail,
  getLatestPosts,
  getAllArticles,
  getComments,
  addComment,
  getCategories,
  getSocialPosts,
};

export default PublicBlogService;
