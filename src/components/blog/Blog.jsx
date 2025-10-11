// ====================================================
// 📘 Blog Hub (List & Detail)
// Polished version — Theme + UX + Safety aligned
// ====================================================
import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import PublicBlogService from "../../api/services/publicBlogService";
import SocialHub from "../social/SocialHub";
import fallbackImage from "../../assets/logo1.png"; // brand fallback
import "./blog.css";

// ====================================================
// 🔒 Helper: Safe API Fetch Wrapper
// ====================================================
const safeFetch = async (fn, fallback = []) => {
  try {
    const res = await fn();
    return res || fallback;
  } catch (err) {
    console.error("[BlogHub] API error:", err);
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

  useEffect(() => {
    let active = true;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [fetchedPosts, fetchedCategories, fetchedSocial] = await Promise.all([
          safeFetch(() => PublicBlogService.getLatestPosts()),
          safeFetch(() => PublicBlogService.getCategories()),
          safeFetch(() => PublicBlogService.getSocialPosts()),
        ]);

        if (active) {
          setPosts(fetchedPosts);
          setCategories(fetchedCategories);
          setSocialPosts(fetchedSocial);
        }
      } catch {
        if (active) setError("Unable to load blog data.");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData();
    return () => {
      active = false;
    };
  }, [location]);

  // 🔎 Search & Category Filter
  const filteredPosts = posts
    .filter((p) => p.title?.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => !categorySlug || p.category?.slug === categorySlug);

  if (loading) return <p className="text-center p-6">Loading blog posts...</p>;
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

      {/* 📰 Posts Grid */}
      <div className="blog-posts-grid">
        {filteredPosts.length === 0 && (
          <p className="no-posts">No posts found.</p>
        )}
        {filteredPosts.map((post) => (
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
                  post.content?.slice(0, 140) ||
                  "Read our latest insights..."}
              </p>
              <small className="blog-post-meta">
                {post.created_at
                  ? new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                    }).format(new Date(post.created_at))
                  : "—"}{" "}
                | {post.category?.name || "Uncategorized"}
              </small>
              <Button asChild>
                <Link to={`/blog/${post.slug}`}>Read More</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 🌐 Social Feed */}
      <div className="blog-social-section">
        <h2>Latest on Social Media</h2>
        <SocialHub socialPosts={socialPosts} />
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

  // 🗞 Fetch Post + Comments
  useEffect(() => {
    let active = true;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [fetchedPost, fetchedComments, fetchedSocial] = await Promise.all([
          safeFetch(() => PublicBlogService.getPostDetail(slug), null),
          safeFetch(() => PublicBlogService.getComments(slug)),
          safeFetch(() => PublicBlogService.getSocialPosts()),
        ]);

        if (active) {
          setPost(fetchedPost);
          setComments(fetchedComments);
          setSocialPosts(fetchedSocial);
        }
      } catch {
        if (active) setError("Unable to load post details.");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData();
    return () => {
      active = false;
    };
  }, [slug]);

  // 💬 Handle Comment Submit
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    await safeFetch(() =>
      PublicBlogService.addComment(slug, { content: commentContent })
    );
    setCommentContent("");

    const refreshed = await safeFetch(() =>
      PublicBlogService.getComments(slug)
    );
    setComments(refreshed);
  };

  // 🖋️ Render
  if (loading) return <p className="text-center p-6">Loading...</p>;
  if (error) return <p className="text-center p-6 text-red-600">{error}</p>;
  if (!post) return <p className="text-center p-6">Post not found.</p>;

  return (
    <div className="blog-detail-container animate-fade-in">
      <h1 className="blog-detail-title">{post.title}</h1>
      <p className="blog-detail-meta">
        {post.publish_date || post.created_at
          ? new Intl.DateTimeFormat("en-US", {
              dateStyle: "medium",
            }).format(new Date(post.publish_date || post.created_at))
          : "—"}{" "}
        | {post.category?.name || "Uncategorized"}
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

        {comments.length === 0 && (
          <p className="no-comments">No comments yet.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="comment-item">
            <p className="comment-user">{c.user || c.guest_name || "Guest"}</p>
            <p className="comment-content">{c.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
