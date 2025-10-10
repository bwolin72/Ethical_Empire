// src/components/social/ConnectHub.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SocialHub from "./SocialHub";
import AuthContext from "../context/AuthContext";
import authService from "../../api/services/authService";
import { roleRoutes } from "../../routes/roleRoutes";
import "./ConnectHub.css";

const ConnectHub = () => {
  const { auth, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const user = auth?.user;
  const [previewPosts, setPreviewPosts] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [connecting, setConnecting] = useState(false);

  // ===============================
  // 🌍 Fetch Public Feed for Guests
  // ===============================
  useEffect(() => {
    if (!isAuthenticated) {
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

  // ===============================
  // 🚀 Handle Dashboard Redirect
  // ===============================
  const handleActionClick = async () => {
    if (!isAuthenticated) {
      toast.info("Please login or create an account to connect.");
      return navigate("/login");
    }

    try {
      setConnecting(true);

      // Get fresh profile or fallback to context user
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
  // 🖼️ UI
  // ===============================
  return (
    <div className="connect-hub-container">
      {/* 🔹 Hero Section */}
      <section className="connect-hero">
        <h1>Connect With EETHM</h1>
        <p>
          Join our growing network of creatives, vendors, and event professionals.
          Explore collaborations, opportunities, and stories that move the
          industry forward.
        </p>

        <button
          className="connect-action-btn"
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
                    <small>
                      {new Date(post.created_at).toLocaleDateString()}{" "}
                      {new Date(post.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-preview">
                No public posts yet — be the first to share!
              </p>
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
