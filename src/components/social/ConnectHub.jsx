import React, { useContext, useEffect, useState, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthContext from "../context/AuthContext";
import authService from "../../api/services/authService";
import { roleRoutes } from "../../routes/roleRoutes";
import "./SocialHub.css";

// Lazy load for performance
const SocialHub = React.lazy(() => import("./SocialHub"));

const ConnectHub = () => {
  const { auth, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [previewPosts, setPreviewPosts] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const user = auth?.user;
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "https://api.eethm.com";

  // Fetch public feed for guests
  useEffect(() => {
    if (!isAuthenticated) {
      const fetchPreview = async () => {
        try {
          setLoadingPreview(true);
          const res = await fetch(`${API_BASE}/social/public-feed/?limit=4`);
          if (!res.ok) throw new Error("Failed to fetch social feed.");
          const data = await res.json();
          setPreviewPosts(data?.results || []);
        } catch (err) {
          console.error("[ConnectHub] Public feed error:", err);
          setPreviewPosts([]);
        } finally {
          setLoadingPreview(false);
        }
      };
      fetchPreview();
    }
  }, [isAuthenticated, API_BASE]);

  // Handle dashboard redirect
  const handleActionClick = async () => {
    if (!isAuthenticated) {
      toast.info("Please log in or create an account to connect.");
      navigate("/login");
      return;
    }

    try {
      setConnecting(true);

      const profile = await authService.getProfile().catch(() => null);
      const role = 
        profile?.role?.trim()?.toLowerCase() || 
        user?.role?.trim()?.toLowerCase();

      if (role && roleRoutes[role]) {
        toast.success(`Welcome back, ${user?.name || "User"}!`);
        navigate(roleRoutes[role], { replace: true });
      } else {
        console.warn("[ConnectHub] Missing or invalid role:", role);
        toast.error("Your account role could not be verified.");
        navigate("/unauthorized", { replace: true });
      }
    } catch (err) {
      console.error("[ConnectHub] Connection error:", err);
      toast.error("Could not verify account. Please log in again.");
      navigate("/login", { replace: true });
    } finally {
      setConnecting(false);
    }
  };

  // Format date for display
  const formatDateTime = (dateStr) => 
    new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateStr));

  return (
    <div className="connect-hub theme-multimedia">
      {/* Hero Section */}
      <section className="connect-hero animate-fade-in-up">
        <div className="hero-content">
          <h1 className="hero-title">
            Connect With <span className="gradient-text">EETHM</span>
          </h1>
          <p className="hero-subtitle">
            Join our growing network of creatives, vendors, and event professionals.
            Discover collaborations, opportunities, and stories that move the industry forward.
          </p>
          
          <button
            className="btn-primary btn-lg"
            onClick={handleActionClick}
            disabled={connecting}
            aria-label={isAuthenticated ? "Go to dashboard" : "Login or sign up"}
          >
            {connecting ? (
              <span className="btn-loading">
                <span className="spinner"></span> Connecting...
              </span>
            ) : isAuthenticated ? (
              "Go to My Dashboard"
            ) : (
              "Login or Sign Up"
            )}
          </button>
        </div>
      </section>

      {/* Social Preview Section */}
      <section className="social-preview-section">
        {isAuthenticated ? (
          <Suspense fallback={
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading community...</p>
            </div>
          }>
            <SocialHub />
          </Suspense>
        ) : (
          <div className="preview-container">
            <div className="section-header">
              <h2 className="section-title">
                <span className="icon-globe">🌍</span>
                Explore the EETHM Community
              </h2>
              <p className="section-description">
                Preview what our community is sharing
              </p>
            </div>

            {loadingPreview ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading latest posts...</p>
              </div>
            ) : previewPosts.length > 0 ? (
              <div className="preview-grid">
                {previewPosts.map((post) => (
                  <article key={post.id} className="preview-card">
                    <div className="card-header">
                      <div className="author-avatar">
                        {post.author_name?.charAt(0) || "A"}
                      </div>
                      <div className="author-info">
                        <h4 className="author-name">{post.author_name || "Anonymous"}</h4>
                        <time className="post-time" dateTime={post.created_at}>
                          {formatDateTime(post.created_at)}
                        </time>
                      </div>
                    </div>
                    <div className="card-content">
                      <p className="post-excerpt">
                        {post.content?.slice(0, 160) || "Shared a new update..."}
                        {post.content?.length > 160 && "..."}
                      </p>
                    </div>
                    <div className="card-footer">
                      <span className="post-badge">Preview</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>No public posts yet</h3>
                <p>Be the first to share your story!</p>
              </div>
            )}

            {/* Join CTA */}
            <div className="join-cta animate-fade-in">
              <div className="cta-content">
                <h3>Ready to join the conversation?</h3>
                <p>Create an account to share your work, connect with professionals, and stay updated.</p>
              </div>
              <button
                className="btn-secondary"
                onClick={() => navigate("/register")}
                aria-label="Join the EETHM community"
              >
                Join the Community
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ConnectHub;
