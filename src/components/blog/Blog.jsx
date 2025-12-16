// src/components/blog/BlogHub.js
import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import PublicBlogService from "../../api/services/publicBlogService";
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
  <div className="blog-post-card skeleton">
    <div className="blog-post-image skeleton-box" />
    <div className="blog-post-content">
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line skeleton-excerpt" />
      <div className="skeleton-line skeleton-meta" />
      <div className="skeleton-line skeleton-button" />
    </div>
  </div>
);

const DetailSkeleton = () => (
  <div className="blog-detail-container animate-fade-in">
    <div className="skeleton-line skeleton-detail-title" />
    <div className="skeleton-line skeleton-detail-meta" />
    <div className="skeleton-box skeleton-detail-image" />
    <div className="skeleton-line skeleton-content" />
    <div className="skeleton-line skeleton-content" />
    <div className="skeleton-line skeleton-content" />
  </div>
);

// ====================================================
// 📰 BLOG LIST PAGE
// ====================================================
export function BlogList() {
  const { categorySlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [socialPosts, setSocialPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  const fetchSocialPosts = useCallback(async () => {
    let data = await safeFetch(() => PublicBlogService.getLatestSocialPosts());
    if (!data.length) {
      console.warn("[BlogList] Latest social posts empty, falling back to legacy feed");
      data = await safeFetch(() => PublicBlogService.getLegacySocialFeed());
    }
    return data;
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedPosts, fetchedCategories, fetchedSocial] = await Promise.all([
        safeFetch(() => PublicBlogService.getLatestPosts()),
        safeFetch(() => PublicBlogService.getCategories()),
        fetchSocialPosts(),
      ]);

      setPosts(fetchedPosts);
      setCategories(fetchedCategories);
      setSocialPosts(fetchedSocial);
    } catch (err) {
      console.error("[BlogList] fetch error:", err);
      setError("Unable to load blog data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [fetchSocialPosts]);

  useEffect(() => {
    fetchData();
  }, [location, fetchData]);

  const filteredPosts = posts.filter((p) => {
    const matchesSearch = p.title?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categorySlug || p.category?.slug === categorySlug;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const handleCategoryClick = (slug) => {
    navigate(slug ? `/blog/category/${slug}` : "/blog");
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="blog-container">
        <div className="blog-error">
          <h2>⚠️ Unable to Load Blog</h2>
          <p>{error}</p>
          <button onClick={fetchData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-container animate-fade-in-up">
      <header className="blog-header">
        <h1 className="blog-title">EethmGH Blog Hub</h1>
        <p className="blog-subtitle">
          Insights, stories, and updates from Ghana's premier event partner
        </p>
      </header>

      <div className="blog-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={handleSearch}
            className="blog-search-input"
            aria-label="Search blog posts"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="categories-container">
          <div className="categories-header">
            <h3>Categories</h3>
            <span className="category-count">{categories.length} topics</span>
          </div>
          <div className="blog-categories">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`category-btn ${!categorySlug ? "active" : ""}`}
              aria-pressed={!categorySlug}
            >
              All Posts
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`category-btn ${categorySlug === cat.slug ? "active" : ""}`}
                aria-pressed={categorySlug === cat.slug}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="blog-stats">
        <div className="stat-card">
          <span className="stat-number">{filteredPosts.length}</span>
          <span className="stat-label">Articles</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{categories.length}</span>
          <span className="stat-label">Categories</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{socialPosts.length}</span>
          <span className="stat-label">Social Updates</span>
        </div>
      </div>

      <div className="blog-posts-grid">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <PostSkeleton key={i} />)
          : currentPosts.length > 0
          ? currentPosts.map((post) => (
              <article key={post.id} className="blog-post-card">
                <div className="post-image-container">
                  <img
                    src={post.featured_image || fallbackImage}
                    alt={post.title || "Blog post"}
                    className="blog-post-image"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = fallbackImage;
                    }}
                  />
                  {post.category && (
                    <span className="post-category-badge">
                      {post.category.name}
                    </span>
                  )}
                </div>
                <div className="blog-post-content">
                  <h2 className="blog-post-title">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="blog-post-excerpt">
                    {post.excerpt || (post.content?.slice(0, 160) + "...")}
                  </p>
                  <div className="post-meta">
                    <time className="post-date">
                      {post.created_at
                        ? new Intl.DateTimeFormat("en-US", { 
                            dateStyle: "medium" 
                          }).format(new Date(post.created_at))
                        : "—"}
                    </time>
                    <span className="post-read-time">5 min read</span>
                  </div>
                  <Link to={`/blog/${post.slug}`} className="read-more-button">
                    Read Article →
                  </Link>
                </div>
              </article>
            ))
          : !loading && (
              <div className="no-posts-message">
                <h3>No posts found</h3>
                <p>Try adjusting your search or category filter</p>
              </div>
            )
        }
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="pagination-button prev"
            aria-label="Previous page"
          >
            ← Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`page-number ${currentPage === pageNum ? "active" : ""}`}
                  aria-label={`Page ${pageNum}`}
                  aria-current={currentPage === pageNum ? "page" : undefined}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="page-dots">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="page-number"
                  aria-label={`Page ${totalPages}`}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="pagination-button next"
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      )}

      <section className="blog-social-section">
        <div className="section-header">
          <h2>Latest on Social</h2>
          <p>Stay connected with our latest updates</p>
        </div>
        {loading ? (
          <div className="social-skeleton">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        ) : (
          <SocialHub socialPosts={socialPosts} />
        )}
      </section>

      <footer className="blog-footer">
        <p>Want to contribute or suggest a topic?</p>
        <a href="/contact" className="contact-link">
          Contact our editorial team
        </a>
      </footer>
    </div>
  );
}

// ====================================================
// 🧾 BLOG DETAIL PAGE
// ====================================================
export function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [socialPosts, setSocialPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchSocialPosts = useCallback(async () => {
    let data = await safeFetch(() => PublicBlogService.getLatestSocialPosts());
    if (!data.length) {
      data = await safeFetch(() => PublicBlogService.getLegacySocialFeed());
    }
    return data;
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [fetchedPost, fetchedComments, fetchedSocial] = await Promise.all([
        safeFetch(() => PublicBlogService.getPostBySlug(slug), null),
        safeFetch(() => PublicBlogService.getComments(slug)),
        fetchSocialPosts(),
      ]);

      if (!fetchedPost) {
        setError("Article not found");
        return;
      }

      setPost(fetchedPost);
      setComments(fetchedComments);
      setSocialPosts(fetchedSocial);

      // Fetch related posts based on category
      if (fetchedPost.category) {
        const related = await safeFetch(() => 
          PublicBlogService.getPostsByCategory(fetchedPost.category.slug)
        );
        setRelatedPosts(related.filter(p => p.slug !== slug).slice(0, 3));
      }
    } catch (err) {
      console.error("[BlogDetail] fetch error:", err);
      setError("Unable to load article. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [slug, fetchSocialPosts]);

  useEffect(() => {
    fetchData();
  }, [slug, fetchData]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      await safeFetch(() => 
        PublicBlogService.submitComment(slug, { content: commentContent })
      );
      setCommentContent("");
      
      // Refresh comments
      const refreshed = await safeFetch(() => PublicBlogService.getComments(slug));
      setComments(refreshed);
    } catch (err) {
      console.error("[BlogDetail] comment submit error:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleBackToBlog = () => {
    navigate("/blog");
  };

  if (error) {
    return (
      <div className="blog-detail-container">
        <div className="blog-error">
          <h2>⚠️ {error}</h2>
          <p>The article you're looking for might have been moved or deleted.</p>
          <button onClick={handleBackToBlog} className="back-button">
            ← Back to Blog
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <DetailSkeleton />;

  return (
    <div className="blog-detail-container animate-fade-in">
      <button onClick={handleBackToBlog} className="back-button" aria-label="Back to blog">
        ← Back to Blog
      </button>

      <article className="blog-article">
        <header className="article-header">
          <div className="article-meta">
            {post.category && (
              <span className="article-category">{post.category.name}</span>
            )}
            <time className="article-date">
              {post.publish_date || post.created_at
                ? new Intl.DateTimeFormat("en-US", { 
                    dateStyle: "long" 
                  }).format(new Date(post.publish_date || post.created_at))
                : "—"}
            </time>
            <span className="article-read-time">5 min read</span>
          </div>
          <h1 className="article-title">{post.title}</h1>
          <p className="article-subtitle">{post.excerpt}</p>
        </header>

        <div className="article-content-wrapper">
          {post.featured_image && (
            <div className="article-image-container">
              <img
                src={post.featured_image}
                alt={post.title}
                className="article-featured-image"
                loading="lazy"
                onError={(e) => {
                  e.target.src = fallbackImage;
                }}
              />
              {post.image_caption && (
                <figcaption className="image-caption">
                  {post.image_caption}
                </figcaption>
              )}
            </div>
          )}

          <div 
            className="article-content" 
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {(post.youtube_url || post.tiktok_url) && (
            <div className="article-media">
              {post.youtube_url && (
                <div className="video-embed">
                  <iframe
                    width="100%"
                    height="400"
                    src={post.youtube_url.replace("watch?v=", "embed/")}
                    title="YouTube video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              )}
              {post.tiktok_url && (
                <div className="tiktok-embed">
                  <blockquote 
                    className="tiktok-embed" 
                    cite={post.tiktok_url}
                    data-video-id={post.tiktok_url.split("/").pop()}
                  >
                    <a href={post.tiktok_url}>Watch on TikTok</a>
                  </blockquote>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="article-footer">
          <div className="share-section">
            <h3>Share this article</h3>
            <div className="share-buttons">
              <button className="share-button" aria-label="Share on Twitter">
                🐦 Twitter
              </button>
              <button className="share-button" aria-label="Share on Facebook">
                📘 Facebook
              </button>
              <button className="share-button" aria-label="Share on LinkedIn">
                💼 LinkedIn
              </button>
            </div>
          </div>
        </footer>
      </article>

      {relatedPosts.length > 0 && (
        <section className="related-posts">
          <h2>Related Articles</h2>
          <div className="related-grid">
            {relatedPosts.map((related) => (
              <div key={related.id} className="related-card">
                <img
                  src={related.featured_image || fallbackImage}
                  alt={related.title}
                  className="related-image"
                  loading="lazy"
                />
                <div className="related-content">
                  <h3>
                    <Link to={`/blog/${related.slug}`}>{related.title}</Link>
                  </h3>
                  <p>{related.excerpt?.slice(0, 100)}...</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="comments-section">
        <h2>Comments ({comments.length})</h2>
        
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Share your thoughts..."
            className="comment-input"
            aria-label="Add comment"
            rows="4"
            required
          />
          <button 
            type="submit" 
            className="submit-comment-button"
            disabled={!commentContent.trim() || submittingComment}
          >
            {submittingComment ? "Posting..." : "Post Comment"}
          </button>
        </form>

        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="no-comments">
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-author">
                    {comment.user || comment.guest_name || "Guest"}
                  </span>
                  <time className="comment-date">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </time>
                </div>
                <p className="comment-body">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="social-updates-section">
        <div className="section-header">
          <h2>Latest Social Updates</h2>
          <p>Follow us for more content</p>
        </div>
        <SocialHub socialPosts={socialPosts} />
      </section>
    </div>
  );
}
