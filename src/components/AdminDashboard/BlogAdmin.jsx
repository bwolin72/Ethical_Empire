// src/admin/BlogAdmin.jsx
import React, { useEffect, useState } from "react";
import BlogService from "../../api/services/blogService";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { Trash, Edit, Save, Check, RefreshCw } from "lucide-react";
import "./blog-admin.css";

/* 🧩 PRO TIP:
   This admin panel is synced with the Django REST backend.
   - Posts: /blog/posts/
   - Categories: /blog/categories/
   - Comments: nested under /blog/posts/{slug}/comments/
   - Social Sync: /blog/posts/{slug}/sync-social/
   All endpoints require a valid JWT token in localStorage.token
*/

export default function BlogAdmin() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [inlineEdit, setInlineEdit] = useState({});
  const [openComments, setOpenComments] = useState({});

  const [postForm, setPostForm] = useState({
    title: "",
    content: "",
    category_id: "",
    featured_image: null,
    status: 0,
    publish_date: "",
    youtube_url: "",
    tiktok_url: "",
  });

  const [categoryForm, setCategoryForm] = useState({ name: "" });
  const token = localStorage.getItem("token");

  // -----------------------------
  // Utility: Safe API wrapper
  // -----------------------------
  const safeFetch = async (fn, fallback = null) => {
    try {
      const res = await fn();
      return res || fallback;
    } catch (err) {
      console.error(err);
      alert("An error occurred while fetching data.");
      return fallback;
    }
  };

  // -----------------------------
  // Initial Data Load
  // -----------------------------
  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const fetchedPosts = await safeFetch(() => BlogService.getPosts(), []);
      const fetchedCategories = await safeFetch(() => BlogService.getCategories(), []);
      setPosts(fetchedPosts);
      setCategories(fetchedCategories);
    } catch {
      setError("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Post CRUD
  // -----------------------------
  const handlePostChange = (e) => {
    const { name, value, files } = e.target;
    setPostForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(postForm).forEach(([key, value]) => {
      if (value !== null && value !== "") formData.append(key, value);
    });

    await safeFetch(() =>
      editingPost
        ? BlogService.updatePost(editingPost.slug, formData, token)
        : BlogService.createPost(formData, token)
    );

    setEditingPost(null);
    setPostForm({
      title: "",
      content: "",
      category_id: "",
      featured_image: null,
      status: 0,
      publish_date: "",
      youtube_url: "",
      tiktok_url: "",
    });
    fetchAdminData();
  };

  const handleEditPostInline = (post) => {
    setInlineEdit((prev) => ({
      ...prev,
      [post.slug]: {
        title: post.title,
        content: post.content,
        category_id: post.category?.id || "",
        status: post.status,
        publish_date: post.publish_date ? post.publish_date.slice(0, 16) : "",
      },
    }));
  };

  const handleInlineEditChange = (slug, field, value) => {
    setInlineEdit((prev) => ({
      ...prev,
      [slug]: { ...prev[slug], [field]: value },
    }));
  };

  const handleInlineSave = async (post) => {
    const data = inlineEdit[post.slug];
    if (!data) return;
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== "") formData.append(key, value);
    });
    await safeFetch(() => BlogService.updatePost(post.slug, formData, token));
    setInlineEdit((prev) => ({ ...prev, [post.slug]: null }));
    fetchAdminData();
  };

  const handleDeletePost = async (slug) => {
    if (!window.confirm("Delete this post?")) return;
    await safeFetch(() => BlogService.deletePost(slug, token));
    setPosts(posts.filter((p) => p.slug !== slug));
  };

  const handleSyncSocial = async (slug) => {
    await safeFetch(() => BlogService.syncSocialPost(slug));
    alert("Social sync queued successfully.");
  };

  // -----------------------------
  // Category CRUD
  // -----------------------------
  const handleCategoryChange = (e) => setCategoryForm({ name: e.target.value });

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    await safeFetch(() =>
      editingCategory
        ? BlogService.updateCategory(editingCategory.slug, categoryForm, token)
        : BlogService.createCategory(categoryForm, token)
    );
    setEditingCategory(null);
    setCategoryForm({ name: "" });
    fetchAdminData();
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name });
  };

  const handleDeleteCategory = async (slug) => {
    if (!window.confirm("Delete this category?")) return;
    await safeFetch(() => BlogService.deleteCategory(slug, token));
    setCategories(categories.filter((c) => c.slug !== slug));
  };

  // -----------------------------
  // Comment Handlers (on-demand)
  // -----------------------------
  const toggleComments = async (postSlug) => {
    setOpenComments((prev) => ({ ...prev, [postSlug]: !prev[postSlug] }));
    if (!comments[postSlug]) {
      const postComments = await safeFetch(() => BlogService.getComments(postSlug), []);
      setComments((prev) => ({ ...prev, [postSlug]: postComments }));
    }
  };

  const handleApproveComment = async (postSlug, commentId) => {
    await safeFetch(() => BlogService.updateComment(commentId, { approved: true }, token));
    const updatedComments = await BlogService.getComments(postSlug);
    setComments((prev) => ({ ...prev, [postSlug]: updatedComments }));
  };

  const handleDeleteComment = async (postSlug, commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    await safeFetch(() => BlogService.deleteComment(commentId, token));
    const updatedComments = await BlogService.getComments(postSlug);
    setComments((prev) => ({ ...prev, [postSlug]: updatedComments }));
  };

  // -----------------------------
  // Render
  // -----------------------------
  if (loading) return <p className="text-center p-6">Loading...</p>;
  if (error) return <p className="text-center p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* ===== Categories ===== */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Categories</h2>
        <form onSubmit={handleCategorySubmit} className="mb-4 flex gap-2">
          <input
            type="text"
            value={categoryForm.name}
            onChange={handleCategoryChange}
            placeholder="Category Name"
            className="p-2 border rounded-lg flex-1"
            required
          />
          <Button type="submit">
            <Save className="w-4 h-4 mr-1" />
            {editingCategory ? "Update" : "Add"}
          </Button>
        </form>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id} className="p-4 flex justify-between items-center">
              <span>{cat.name}</span>
              <div className="flex gap-2">
                <Button onClick={() => handleEditCategory(cat)} variant="outline">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button onClick={() => handleDeleteCategory(cat.slug)} variant="destructive">
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ===== Posts ===== */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Posts</h2>

        {/* Add/Edit Post Form */}
        <form onSubmit={handlePostSubmit} className="mb-6 grid gap-4">
          <input
            type="text"
            name="title"
            value={postForm.title}
            onChange={handlePostChange}
            placeholder="Post Title"
            className="p-2 border rounded-lg"
            required
          />
          <select
            name="category_id"
            value={postForm.category_id}
            onChange={handlePostChange}
            className="p-2 border rounded-lg"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <textarea
            name="content"
            value={postForm.content}
            onChange={handlePostChange}
            placeholder="Post Content (HTML allowed)"
            className="p-2 border rounded-lg"
            rows={5}
            required
          />
          <input type="file" name="featured_image" onChange={handlePostChange} />
          <input
            type="url"
            name="youtube_url"
            value={postForm.youtube_url}
            onChange={handlePostChange}
            placeholder="YouTube URL"
            className="p-2 border rounded-lg"
          />
          <input
            type="url"
            name="tiktok_url"
            value={postForm.tiktok_url}
            onChange={handlePostChange}
            placeholder="TikTok URL"
            className="p-2 border rounded-lg"
          />
          <select
            name="status"
            value={postForm.status}
            onChange={handlePostChange}
            className="p-2 border rounded-lg"
          >
            <option value={0}>Draft</option>
            <option value={1}>Published</option>
            <option value={2}>Scheduled</option>
          </select>
          <input
            type="datetime-local"
            name="publish_date"
            value={postForm.publish_date}
            onChange={handlePostChange}
            className="p-2 border rounded-lg"
          />
          <Button type="submit">
            <Save className="w-4 h-4 mr-1" />
            {editingPost ? "Update Post" : "Add Post"}
          </Button>
        </form>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => {
            const isEditing = !!inlineEdit[post.slug];
            return (
              <Card key={post.id} className="shadow-md rounded-2xl overflow-hidden">
                {post.featured_image && (
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <CardContent className="p-4">
                  {isEditing ? (
                    <div className="grid gap-2">
                      <input
                        type="text"
                        value={inlineEdit[post.slug].title}
                        onChange={(e) =>
                          handleInlineEditChange(post.slug, "title", e.target.value)
                        }
                        className="p-2 border rounded-lg"
                      />
                      <select
                        value={inlineEdit[post.slug].category_id}
                        onChange={(e) =>
                          handleInlineEditChange(post.slug, "category_id", e.target.value)
                        }
                        className="p-2 border rounded-lg"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <textarea
                        value={inlineEdit[post.slug].content}
                        onChange={(e) =>
                          handleInlineEditChange(post.slug, "content", e.target.value)
                        }
                        className="p-2 border rounded-lg"
                        rows={4}
                      />
                      <select
                        value={inlineEdit[post.slug].status}
                        onChange={(e) =>
                          handleInlineEditChange(post.slug, "status", e.target.value)
                        }
                        className="p-2 border rounded-lg"
                      >
                        <option value={0}>Draft</option>
                        <option value={1}>Published</option>
                        <option value={2}>Scheduled</option>
                      </select>
                      <input
                        type="datetime-local"
                        value={inlineEdit[post.slug].publish_date}
                        onChange={(e) =>
                          handleInlineEditChange(post.slug, "publish_date", e.target.value)
                        }
                        className="p-2 border rounded-lg"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button onClick={() => handleInlineSave(post)} variant="primary">
                          <Save className="w-4 h-4 mr-1" /> Save
                        </Button>
                        <Button
                          onClick={() =>
                            setInlineEdit((prev) => ({ ...prev, [post.slug]: null }))
                          }
                          variant="destructive"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-bold mb-2">{post.title}</h3>
                      <p className="text-gray-600 mb-2">{post.category?.name}</p>
                      <p className="text-gray-500 mb-4">
                        {post.content.slice(0, 100)}...
                      </p>
                      <div className="flex gap-2 mb-2">
                        <Button
                          onClick={() => handleEditPostInline(post)}
                          variant="outline"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeletePost(post.slug)}
                          variant="destructive"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleSyncSocial(post.slug)}
                          variant="secondary"
                        >
                          <RefreshCw className="w-4 h-4" /> Sync
                        </Button>
                      </div>

                      {/* Comments */}
                      <div className="comment-wrapper mb-2">
                        <div
                          className="comment-header cursor-pointer"
                          onClick={() => toggleComments(post.slug)}
                        >
                          <span>
                            Comments ({(comments[post.slug] || []).length})
                          </span>
                        </div>
                        {openComments[post.slug] && (
                          <div className="comment-content flex flex-col gap-2 mt-2">
                            {(comments[post.slug] || []).map((c) => (
                              <div
                                key={c.id}
                                className="border-l-2 border-primary-light pl-2 py-1 flex justify-between items-center"
                              >
                                <div>
                                  <p className="font-semibold">
                                    {c.user || c.guest_name || "Guest"}
                                  </p>
                                  <p className="text-sm text-gray-600">{c.content}</p>
                                </div>
                                <div className="flex gap-1">
                                  {!c.approved && (
                                    <Button
                                      onClick={() =>
                                        handleApproveComment(post.slug, c.id)
                                      }
                                      variant="primary"
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button
                                    onClick={() =>
                                      handleDeleteComment(post.slug, c.id)
                                    }
                                    variant="destructive"
                                  >
                                    <Trash className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
