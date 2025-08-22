// src/components/UserPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import { ToastContainer, toast } from "react-toastify";
import BannerCards from "../context/BannerCards";
import MediaCards from "../context/MediaCards";
import FadeInSection from "../FadeInSection";
import ProfileAvatar from "./ProfileAvatar";
import NewsletterSignup from "./NewsLetterSignup"; // ✅ centralized newsletter component
import "react-toastify/dist/ReactToastify.css";
import "./UserPage.css";

const services = [
  { title: "Live Band", desc: "Experience live music with Asaase Band.", icon: "🎸" },
  { title: "Catering", desc: "Delicious catering for your events.", icon: "🍽️" },
  { title: "Decor", desc: "Beautiful event decorations.", icon: "🎉" },
  { title: "Photography", desc: "Capture memories with our photographers.", icon: "📸" },
  { title: "Lighting", desc: "Professional lighting setup.", icon: "💡" },
  { title: "Sound", desc: "High-quality sound systems.", icon: "🔊" },
];

const UserPage = () => {
  const [profile, setProfile] = useState(null);
  const [media, setMedia] = useState([]);
  const [videos, setVideos] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // normalize responses whether paginated or not
  const extractList = (res) => {
    if (!res) return [];
    const payload = res.data ?? res;
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.results)) return payload.results;
    if (Array.isArray(payload.data)) return payload.data;
    return [];
  };

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchData = async () => {
      setLoading(true);

      try {
        const [
          profileRes,
          mediaRes,
          reviewsRes,
          promoRes,
          videosRes,
        ] = await Promise.all([
          apiService.auth?.getProfile?.({ signal }) ??
            Promise.resolve({ data: null }),

          apiService.media?.user?.({ signal }) ??
            apiService.media?.getAllMedia?.({ signal }) ??
            Promise.resolve({ data: [] }),

          apiService.reviews?.list?.({ signal }) ??
            Promise.resolve({ data: [] }),

          apiService.promotions?.active?.({ signal }) ??
            apiService.promotions?.list?.({ signal }) ??
            Promise.resolve({ data: [] }),

          apiService.videos?.list?.({ signal }) ??
            Promise.resolve({ data: [] }),
        ]);

        setProfile(profileRes?.data ?? null);
        setMedia(extractList(mediaRes));
        setReviews(extractList(reviewsRes));
        setPromotions(extractList(promoRes));
        setVideos(extractList(videosRes));
      } catch (err) {
        if (err?.name !== "CanceledError") {
          console.error("UserPage load error:", err);
          toast.error("Error loading data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  const featuredVideo =
    Array.isArray(videos) && videos.length > 0
      ? videos.find(
          (item) =>
            (item.is_featured || item.featured) &&
            (item.file || item.url || item.video_url)
        )
      : null;

  const onProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  return (
    <div className={`userpage-container ${darkMode ? "dark" : ""}`}>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        theme="colored"
      />

      <header className="userpage-header">
        <h2>Welcome {profile?.name || "Ethical Empire"}</h2>
        <div className="header-right">
          <button
            onClick={toggleDarkMode}
            className="dark-toggle"
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      <FadeInSection>
        <div
          className="avatar-section"
          onClick={() => navigate("/account")}
          style={{ cursor: "pointer", textAlign: "center" }}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => (e.key === "Enter" ? navigate("/account") : null)}
          aria-label="Go to account profile"
        >
          <ProfileAvatar profile={profile} onProfileUpdate={onProfileUpdate} />
          <p className="open-profile-link">
            {profile?.profile_image_url ? "Change Profile" : "Open Profile"}
          </p>
        </div>
      </FadeInSection>

      <p className="intro-text">It's a great day to explore our services!</p>

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : (
        <>
          {featuredVideo ? (
            <FadeInSection>
              <div className="asaase-card">
                <video controls width="100%" preload="metadata">
                  <source
                    src={
                      featuredVideo.file ||
                      featuredVideo.video_url ||
                      featuredVideo.url
                    }
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            </FadeInSection>
          ) : (
            <p className="empty-text">No featured video available.</p>
          )}

          <FadeInSection>
            <section>
              <h3>Featured Banners</h3>
              <BannerCards endpoint="UserPage" />
            </section>
          </FadeInSection>

          {Array.isArray(promotions) && promotions.length > 0 && (
            <section>
              <h3>Special Offers</h3>
              <div className="promotions-grid">
                {promotions.map((promo) => (
                  <FadeInSection key={promo.id}>
                    <div className="promo-card">
                      {promo.image_url && (
                        <img
                          src={promo.image_url}
                          alt={promo.title}
                          loading="lazy"
                          onError={(e) => (e.target.src = "/fallback.jpg")}
                        />
                      )}
                      <h4>{promo.title}</h4>
                      <p>{promo.description}</p>
                      {promo.discount_percentage && (
                        <p className="promo-discount">
                          Discount: {promo.discount_percentage}%
                        </p>
                      )}
                      <p className="promo-valid">
                        Valid: {promo.valid_from} to {promo.valid_to}
                      </p>
                    </div>
                  </FadeInSection>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3>Our Services</h3>
            <div className="services-grid">
              {services.map((s, i) => (
                <FadeInSection key={i}>
                  <div className="service-card">
                    <div className="icon">{s.icon}</div>
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </section>

          <section>
            <h3>Your Media Gallery</h3>
            {media.length > 0 ? (
              <div className="gallery-grid">
                {media.map((item, idx) => (
                  <FadeInSection key={idx}>
                    <MediaCards media={item} />
                  </FadeInSection>
                ))}
              </div>
            ) : (
              <p className="empty-text">No media to display.</p>
            )}
          </section>

          <section>
            <h3>Client Reviews</h3>
            <div className="reviews-list">
              {reviews.length > 0 ? (
                reviews.map((r, i) => (
                  <FadeInSection key={i}>
                    <div className="review-card">
                      <p>"{r.comment}"</p>
                      <small>
                        - {r.user_email || r.user?.email || "Anonymous"}
                      </small>
                      {r.reply && (
                        <div className="review-reply">
                          <strong>Admin Reply:</strong> <p>{r.reply}</p>
                        </div>
                      )}
                    </div>
                  </FadeInSection>
                ))
              ) : (
                <p className="empty-text">No reviews yet.</p>
              )}
              <button
                className="review-btn"
                onClick={() => navigate("/account#reviews")}
              >
                Write a Review
              </button>
            </div>
          </section>

          <section>
            <h3>Subscribe to Our Newsletter</h3>
            {/* ✅ replaced inline form with centralized NewsletterSignup */}
            <NewsletterSignup />
          </section>
        </>
      )}
    </div>
  );
};

export default UserPage;
