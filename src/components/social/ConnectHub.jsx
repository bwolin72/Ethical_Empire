// src/components/social/ConnectHub.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SocialHub from "./SocialHub";
import { AuthContext } from "../context/AuthContext";
import "./ConnectHub.css";

const ConnectHub = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // Local preview state
  const [previewPosts, setPreviewPosts] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(true);

  // Simulated API for demo: replace this with your actual fetch
  useEffect(() => {
    if (!isAuthenticated) {
      // Pretend to fetch public social posts
      const fetchPreview = async () => {
        try {
          setLoadingPreview(true);
          const res = await fetch(
            `${process.env.REACT_APP_API_BASE_URL}/social/public-feed/?limit=4`
          );
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
  }, [isAuthenticated]);

  // Button actions
  const handleActionClick = () => {
    if (isAuthenticated) {
      toast.success(`Welcome back, ${user?.name || "User"}!`);
      navigate("/connect"); // Will auto-redirect by role inside your ConnectRedirect route
    } else {
      toast.info("Please login or create an account to connect.");
      navigate("/login");
    }
  };

  return (
    <div className="connect-hub-container">
      {/* Hero */}
      <section className="connect-hero">
        <h1>Connect With EETHM</h1>
        <p>
          Join our growing community of creatives, vendors, and event planners.  
          Discover opportunities, collaborations, and ideas that move the industry forward.
        </p>

        <button className="connect-action-btn" onClick={handleActionClick}>
          {isAuthenticated ? "Go to My Dashboard" : "Login or Sign Up"}
        </button>
      </section>

      {/* Feed Preview or Full Social Hub */}
      <section className="social-section">
        {isAuthenticated ? (
          <SocialHub />
        ) : (
          <>
            <h2 className="preview-title">🌍 Explore the EETHM Community</h2>
            {loadingPreview ? (
              <p>Loading latest posts...</p>
            ) : previewPosts.length > 0 ? (
              <div className="preview-feed">
                {previewPosts.map((post) => (
                  <div key={post.id} className="preview-card">
                    <h4>{post.author_name || "Anonymous"}</h4>
                    <p>{post.content?.slice(0, 120)}...</p>
                    <small>{new Date(post.created_at).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-preview">No public posts yet. Be the first to share!</p>
            )}

            <div className="join-banner">
              <h3>Want to share your story?</h3>
              <button
                className="connect-signup-btn"
                onClick={() => navigate("/register")}
              >
                Join the Community
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default ConnectHub;
