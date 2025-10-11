// ====================================================
// 🌐 Blog Module — Optimized & Polished
// Unified Blog List + Detail Components
// Brand: EETHM Events & Media
// ====================================================

import React, { useEffect, useState, Suspense, lazy } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import PublicBlogService from "../../api/services/publicBlogService";
import { toast } from "react-toastify";
import "./blog.css";

// Lazy-load SocialHub for better performance
const SocialHub = lazy(() => import("../social/SocialHub"));

// ====================================================
// ✅ Safe Fetch Helper
// ----------------------------------------------------
// Ensures async API calls don't crash components.
// Provides fallback data for graceful handling.
// ====================================================
const safeFetch = async (fn, fallback = null) => {
  try {
    const res = await fn();
    return res ?? fallback;
  } catch (err) {
    console.error("API Error:", err);
    return fallback;
  }
};

// ====================================================
// 📰 BLOG LIST PAGE
// ====================================================
export function BlogList() {
  const { categorySlug } = useParams();
  const location = useLocation();

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [socialPosts, setSocialPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch posts, categories, and social data
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      const [p, c, s] = await Promise.all([
        safeFetch(() => PublicBlogService.getLatestPosts(), []),
        safeFetch(() => PublicBlogService.getCategories(), []),
        safeFetch(() => PublicBlogService.getSocialPosts(), []),
      ]);
      if (active) {
        setPosts(p);
        setCategories(c);
        setSocialPosts(s);
        setLoading(false);
      }
    })().catch(() => {
      if (active) {
        setError("Unable to load blog data.");
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [location]);

  useEffect(() => {
    document.title = "Blog Hub • EETHM Media";
  }, []);

  const filteredPosts = posts
    .filter((p) =>
      typeof p.title === "string"
        ? p.title.toLowerCase().includes(search.toLowerCase())
        : false
    )
    .filter((p) => !categorySlug || p.category?.slug === categorySlug);

  if (loading)
    return (
      <div className="blog-loading">
        <p className="text-center p-6">Loading blog content...</p>
      </div>
    );

  if (error)
    return <p className="text-center p-6 text-red-600">{error}</p>;

  return (
    <div className="blog-container">
      <h1 className="blog-title">Blog Hub</h1>

      {/* 🔍 Search Input */}
      <input
        type="text"
        placeholder="Search posts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="blog-search-input"
        aria-label="Search blog posts"
      />

      {/* 🏷️ Categories */}
      <div className="blog-categories">
        <Button asChild variant={!categorySlug ? "primary" : "outline"}>
          <Link to="/blog">All</Link>
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            asChild
            variant={categorySlug === cat.slug ? "primary" : "outline"}
          >
            <Link to={`/blog/category/${cat.slug}`}>{cat.name}</Link>
          </Button>
        ))}
      </div>

      {/* 🧾 Posts Grid */}
      <div className="blog-posts-grid">
        {filteredPosts.length === 0 ? (
          <p className="no-posts">No posts found.</p>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="blog-post-card">
              {post.featured_image ? (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="blog-post-image"
                  loading="lazy"
                />
              ) : (
                <div className="blog-post-placeholder">No Image</div>
              )}
              <CardContent className="blog-post-content">
                <h2 className="blog-post-title">{post.title}</h2>
                <p className="blog-post-excerpt">
                  {post.excerpt ||
                    (post.content
                      ? post.content.slice(0, 120)
                      : "No description available")}{" "}
                  ...
                </p>
                <Button asChild>
                  <Link to={`/blog/${post.slug}`}>Read More</Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 🌐 Social Feed */}
      <div className="blog-social-posts">
        <h2>Latest on Social Media</h2>
        <Suspense fallback={<p>Loading social feed...</p>}>
          <SocialHub socialPosts={socialPosts} />
        </Suspense>
      </div>
    </div>
  );
}

// ====================================================
// 📝 BLOG DETAIL PAGE
// ====================================================
export function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [socialPosts, setSocialPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch post, comments, and social posts
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const [p, c, s] = await Promise.all([
        safeFetch(() => PublicBlogService.getPostDetail(slug), null),
        safeFetch(() => PublicBlogService.getComments(slug), []),
        safeFetch(() => PublicBlogService.getSocialPosts(), []),
      ]);
      if (active) {
        setPost(p);
        setComments(c);
        setSocialPosts(s);
        document.title = `${p?.title || "Post"} • EETHM Blog`;
        setLoading(false);
      }
    })().catch(() => {
      if (active) {
        setError("Unable to load post details.");
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [slug]);

  // 💬 Handle Comment Submit
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    const ok = await safeFetch(() =>
      PublicBlogService.addComment(slug, { content: commentContent })
    );
    if (ok) {
      toast.success("Comment added!");
      setCommentContent("");
      const refreshed = await safeFetch(() =>
        PublicBlogService.getComments(slug)
      );
      setComments(refreshed);
    }
  };

  if (loading) return <p className="text-center p-6">Loading post...</p>;
  if (error) return <p className="text-center p-6 text-red-600">{error}</p>;
  if (!post) return <p className="text-center p-6">Post not found.</p>;

  return (
    <div className="blog-detail-container">
      <h1 className="blog-detail-title">{post.title}</h1>
      <p className="blog-detail-meta">
        {new Date(post.publish_date || post.created_at).toLocaleDateString()}{" "}
        | {post.category?.name || "Uncategorized"}
      </p>

      {post.featured_image && (
        <img
          src={post.featured_image}
          alt={post.title}
          className="blog-detail-image"
          loading="lazy"
        />
      )}

      <div
        className="blog-detail-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* 🎥 Embedded Media */}
      {post.youtube_url && (
        <div className="blog-media">
          <iframe
            width="100%"
            height="400"
            src={post.youtube_url.replace("watch?v=", "embed/")}
            title="YouTube video"
            allowFullScreen
            className="blog-iframe"
          />
        </div>
      )}

      {post.tiktok_url && (
        <blockquote
          className="tiktok-embed"
          cite={post.tiktok_url}
          data-video-id={post.tiktok_url.split("/").pop()}
        >
          <a href={post.tiktok_url}>Watch on TikTok</a>
        </blockquote>
      )}

      {/* 🌐 Social Section */}
      <div className="blog-social-section">
        <h2>Connect with Us</h2>
        <Suspense fallback={<p>Loading social feed...</p>}>
          <SocialHub socialPosts={socialPosts} />
        </Suspense>
      </div>

      {/* 💬 Comments */}
      <div className="blog-comments">
        <h2>Comments</h2>
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Write a comment..."
            className="comment-textarea"
            rows={4}
            aria-label="Add a comment"
          />
          <Button type="submit">Post Comment</Button>
        </form>

        {comments.length === 0 ? (
          <p className="no-comments">No comments yet.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="comment-item">
              <p className="comment-user">{c.user || c.guest_name || "Guest"}</p>
              <p className="comment-content">{c.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
