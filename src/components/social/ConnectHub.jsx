// src/components/social/ConnectHub.jsx
import React, { useContext, useEffect, useState, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthContext from "../context/AuthContext";
import authService from "../../api/services/authService";
import { roleRoutes } from "../../routes/roleRoutes";
import "./ConnectHub.css";

// ✅ Lazy-load SocialHub for performance
const SocialHub = React.lazy(() => import("./SocialHub"));

const ConnectHub = () => {
  const { auth, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [previewPosts, setPreviewPosts] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const user = auth?.user;
  const API_BASE =
    process.env.REACT_APP_API_BASE_URL || "https://api.eethm.com";

  // ===============================
  // 🌍 Fetch Public Feed for Guests
  // ===============================
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

  // ===============================
  // 🚀 Handle Dashboard Redirect
  // ===============================
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

  // ===============================
  // 🧭 Date Formatter
  // ===============================
  const formatDateTime = (dateStr) =>
    new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateStr));

  // ===============================
  // 🖼️ UI
  // ===============================
  return (
    <div className="connect-hub-container">
      {/* 🔹 Hero Section */}
      <section className="connect-hero">
        <h1 className="connect-title">Connect With EETHM</h1>
        <p className="connect-subtitle">
          Join our growing network of creatives, vendors, and event professionals.
          Discover collaborations, opportunities, and stories that move the
          industry forward.
        </p>

        <button
          className="connect-action-btn"
          aria-label="Connect to your dashboard or sign up"
          onClick={handleActionClick}
          disabled={connecting}
        >
          {connecting
            ? "Connecting..."
            : isAuthenticated
            ? "Go to My Dashboard"
            : "Login or Sign Up"}
        </button>
      </section>

      {/* 🔹 Social Section */}
      <section className="social-section">
        {isAuthenticated ? (
          <Suspense fallback={<p className="loading-fallback">Loading community...</p>}>
            <SocialHub />
          </Suspense>
        ) : (
          <>
            <h2 className="preview-title">🌍 Explore the EETHM Community</h2>

            {loadingPreview ? (
              <div className="preview-loading">
                <div className="loader"></div>
                <p>Loading latest posts...</p>
              </div>
            ) : previewPosts.length > 0 ? (
              <div className="preview-feed">
                {previewPosts.map((post) => (
                  <div key={post.id} className="preview-card">
                    <h4>{post.author_name || "Anonymous"}</h4>
                    <p>{post.content?.slice(0, 120)}...</p>
                    <small>{formatDateTime(post.created_at)}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-preview">No public posts yet — be the first to share!</p>
            )}

            <div className="join-banner">
              <h3>Want to share your story?</h3>
              <button
                className="connect-signup-btn"
                aria-label="Join the EETHM community"
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
