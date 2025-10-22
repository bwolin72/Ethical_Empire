// ====================================================
// 📘 Blog Hub (List & Detail)
// Public-Only Version — Synced with PublicBlogService
// ====================================================

import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import PublicBlogService from "../../api/services/PublicBlogService"; // ✅ fixed import
import SocialHub from "../social/SocialHub";
import fallbackImage from "../../assets/logo1.png";
import "./blog.css";

// ====================================================
// 🔒 Safe Fetch Wrapper
// ====================================================
const safeFetch = async (fn, fallback = []) => {
  try {
    const res = await fn();
    return res ?? fallback;
  } catch (err) {
    console.error("[BlogHub] API error:", err);
    return fallback;
  }
};

// ====================================================
// 🦴 Skeleton Components
// ====================================================
const PostSkeleton = () => (
  <Card className="blog-post-card skeleton">
    <div className="blog-post-image skeleton-box" />
    <CardContent className="blog-post-content">
      <div className="skeleton-line w-3/4 mb-2" />
      <div className="skeleton-line w-full mb-2" />
      <div className="skeleton-line w-2/3" />
    </CardContent>
  </Card>
);

const DetailSkeleton = () => (
  <div className="blog-detail-container animate-fade-in">
    <div className="skeleton-line w-1/2 h-8 mb-4" />
    <div className="skeleton-line w-1/3 h-4 mb-6" />
    <div className="skeleton-box w-full h-80 mb-6" />
    <div className="skeleton-line w-full mb-2" />
    <div className="skeleton-line w-5/6 mb-2" />
    <div className="skeleton-line w-4/6 mb-6" />
  </div>
);

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

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [fetchedPosts, fetchedCategories, fetchedSocial] = await Promise.all([
          safeFetch(() => PublicBlogService.getLatestPosts()),
          safeFetch(() => PublicBlogService.getCategories()),
          safeFetch(() => PublicBlogService.getLatestSocialPosts()),
        ]);
        if (active) {
          setPosts(fetchedPosts);
          setCategories(fetchedCategories);
          setSocialPosts(fetchedSocial);
        }
      } catch (err) {
        console.error("[BlogList] fetch error:", err);
        if (active) setError("Unable to load blog data.");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => {
      active = false;
    };
  }, [location]);

  const filteredPosts = posts.filter((p) => {
    const matchesSearch = p.title?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categorySlug || p.category?.slug === categorySlug;
    return matchesSearch && matchesCategory;
  });

  if (error) return <p className="text-center p-6 text-red-600">{error}</p>;

  return (
    <div className="blog-container animate-fade-in-up">
      <h1 className="blog-title">Blog Hub</h1>

      {/* 🔍 Search */}
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
        {categories.length > 0 ? (
          categories.map((cat) => (
            <Button key={cat.id} asChild variant={categorySlug === cat.slug ? "primary" : "outline"}>
              <Link to={`/blog/category/${cat.slug}`}>{cat.name}</Link>
            </Button>
          ))
        ) : (
          <span className="text-sm text-gray-500 italic">No categories available</span>
        )}
      </div>

      {/* 📰 Posts Grid */}
      <div className="blog-posts-grid">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <PostSkeleton key={i} />)
          : filteredPosts.length > 0
          ? filteredPosts.map((post) => (
              <Card key={post.id} className="blog-post-card">
                <img
                  src={post.featured_image || fallbackImage}
                  alt={post.title || "Blog post"}
                  className="blog-post-image"
                  loading="lazy"
                />
                <CardContent className="blog-post-content">
                  <h2 className="blog-post-title">{post.title}</h2>
                  <p className="blog-post-excerpt">
                    {post.excerpt ||
                      (post.content
                        ? post.content.slice(0, 140) + "..."
                        : "Read our latest insights...")}
                  </p>
                  <small className="blog-post-meta">
                    {post.created_at
                      ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                          new Date(post.created_at)
                        )
                      : "—"}{" "}
                    | {post.category?.name?.trim() || "Uncategorized"}
                  </small>
                  <Button asChild>
                    <Link to={`/blog/${post.slug}`}>Read More</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          : !loading && <p className="no-posts">No posts found.</p>}
      </div>

      {/* 🌐 Social Feed */}
      <div className="blog-social-section">
        <h2>Latest on Social Media</h2>
        {loading ? (
          <div className="skeleton-line w-1/2 mb-4" />
        ) : (
          <SocialHub socialPosts={socialPosts} />
        )}
      </div>
    </div>
  );
}

// ====================================================
// 🧾 BLOG DETAIL PAGE
// ====================================================
export function BlogDetail() {
  const { slug } = useParams();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [socialPosts, setSocialPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [fetchedPost, fetchedComments, fetchedSocial] = await Promise.all([
          safeFetch(() => PublicBlogService.getPostBySlug(slug), null),
          safeFetch(() => PublicBlogService.getComments(slug)),
          safeFetch(() => PublicBlogService.getLatestSocialPosts()),
        ]);
        if (active) {
          setPost(fetchedPost);
          setComments(fetchedComments);
          setSocialPosts(fetchedSocial);
        }
      } catch (err) {
        console.error("[BlogDetail] fetch error:", err);
        if (active) setError("Unable to load post details.");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => {
      active = false;
    };
  }, [slug]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    await safeFetch(() =>
      PublicBlogService.submitComment(slug, { content: commentContent })
    );
    setCommentContent("");
    const refreshed = await safeFetch(() => PublicBlogService.getComments(slug));
    setComments(refreshed);
  };

  if (error) return <p className="text-center p-6 text-red-600">{error}</p>;
  if (loading) return <DetailSkeleton />;
  if (!post) return <p className="text-center p-6">Post not found.</p>;

  return (
    <div className="blog-detail-container animate-fade-in">
      <h1 className="blog-detail-title">{post.title}</h1>
      <p className="blog-detail-meta">
        {post.publish_date || post.created_at
          ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
              new Date(post.publish_date || post.created_at)
            )
          : "—"}{" "}
        | {post.category?.name?.trim() || "Uncategorized"}
      </p>

      <img
        src={post.featured_image || fallbackImage}
        alt={post.title || "Blog detail"}
        className="blog-detail-image"
      />

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
            loading="lazy"
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
        <SocialHub socialPosts={socialPosts} />
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
            aria-label="Add comment"
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
