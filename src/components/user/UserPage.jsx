// src/components/UserPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import { ToastContainer, toast } from "react-toastify";
import BannerCards from "../context/BannerCards";
import MediaCards from "../context/MediaCards";
import FadeInSection from "../FadeInSection";
import ProfileAvatar from "./ProfileAvatar";
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
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [loading, setLoading] = useState(true);
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const navigate = useNavigate();

  // Helper to normalise responses whether paginated or not
  const extractList = (res) => {
    if (!res) return [];
    // common patterns: { data: [..] } or axios { data: { results: [..] } } or { data: [..] }
    const payload = res.data ?? res;
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.results)) return payload.results;
    if (Array.isArray(payload.data)) return payload.data;
    // fallback: if payload is object but contains list-like keys, try values
    return [];
  };

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchData = async () => {
      setLoading(true);

      try {
        // Build a list of promises with robust fallbacks for common method names
        const profilePromise =
          (apiService.auth && apiService.auth.getProfile && apiService.auth.getProfile({ signal })) ||
          (apiService.auth && apiService.auth.profile && apiService.auth.profile({ signal })) ||
          Promise.resolve({ data: null });

        // media: prefer user-specific endpoint, else generic list
        const mediaPromise =
          (apiService.media && apiService.media.user && apiService.media.user({ signal })) ||
          (apiService.media && apiService.media.list && apiService.media.list({ params: { is_active: true }, signal })) ||
          Promise.resolve({ data: [] });

        const reviewsPromise =
          (apiService.reviews && apiService.reviews.list && apiService.reviews.list({ signal })) ||
          (apiService.reviews && apiService.reviews.get && apiService.reviews.get({ signal })) ||
          Promise.resolve({ data: [] });

        // promotions: prefer active endpoint, else list
        const promotionsPromise =
          (apiService.promotions && apiService.promotions.active && apiService.promotions.active({ signal })) ||
          (apiService.promotions && apiService.promotions.list && apiService.promotions.list({ signal })) ||
          Promise.resolve({ data: [] });

        // videos: fetch list (backend path: /api/videos/videos/)
        const videosPromise =
          (apiService.videos && apiService.videos.list && apiService.videos.list({ signal })) ||
          (apiService.video && apiService.video.list && apiService.video.list({ signal })) ||
          Promise.resolve({ data: [] });

        // Execute all
        const [profileRes, mediaRes, reviewsRes, promoRes, videosRes] = await Promise.all([
          profilePromise,
          mediaPromise,
          reviewsPromise,
          promotionsPromise,
          videosPromise,
        ]);

        // Apply responses with safe extraction
        const profileData = profileRes?.data ?? null;
        setProfile(profileData);

        const mediaList = extractList(mediaRes);
        setMedia(mediaList);

        const reviewsList = extractList(reviewsRes);
        setReviews(reviewsList);

        const promoList = extractList(promoRes);
        setPromotions(promoList);

        const videosList = extractList(videosRes);
        setVideos(videosList);
      } catch (err) {
        // avoid noisy errors when aborted
        if (err && err.name === "CanceledError") {
          // axios cancel semantics may vary; just ignore
        } else {
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

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!subscriberEmail) return toast.warn("Enter your email to subscribe.");

    try {
      // prefer service method names `subscribe` or `subscribeNewsletter`
      if (apiService.newsletter && apiService.newsletter.subscribe) {
        await apiService.newsletter.subscribe({ email: subscriberEmail });
      } else if (apiService.newsletter && apiService.newsletter.subscribeNewsletter) {
        await apiService.newsletter.subscribeNewsletter({ email: subscriberEmail });
      } else {
        // fallback: try promotion of raw endpoint if available
        throw new Error("Newsletter service not available");
      }

      toast.success("Subscribed! Please check your email to confirm.");
      setSubscriberEmail("");
    } catch (err) {
      console.error("Newsletter subscription error:", err);
      toast.error("Subscription failed. Try again.");
    }
  };

  // pick a featured video (server may mark it with is_featured)
  const featuredVideo =
    Array.isArray(videos) && videos.length > 0
      ? videos.find((item) => (item.is_featured || item.featured) && (item.file || item.url || item.video_url))
      : null;

  // callback that child ProfileAvatar can call after update
  const onProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  return (
    <div className={`userpage-container ${darkMode ? "dark" : ""}`}>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar theme="colored" />

      <header className="userpage-header">
        <h2>Welcome {profile?.name || "Ethical Empire"}</h2>
        <div className="header-right">
          <button onClick={toggleDarkMode} className="dark-toggle" aria-label="Toggle dark mode">
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
          {/* ProfileAvatar now expects profile.profile_image_url and onProfileUpdate callback */}
          <ProfileAvatar profile={profile} onProfileUpdate={onProfileUpdate} />
          <p className="open-profile-link">
            {profile?.profile_image_url ? "Change Profile" : "Set Up Profile"}
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
                  <source src={featuredVideo.file || featuredVideo.video_url || featuredVideo.url} type="video/mp4" />
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
                        <p className="promo-discount">Discount: {promo.discount_percentage}%</p>
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
                      <small>- {r.user_email || r.user?.email || "Anonymous"}</small>
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
              <button className="review-btn" onClick={() => navigate("/account#reviews")}>
                Write a Review
              </button>
            </div>
          </section>

          <section>
            <h3>Subscribe to Our Newsletter</h3>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                value={subscriberEmail}
                onChange={(e) => setSubscriberEmail(e.target.value)}
                required
                aria-label="Email for newsletter subscription"
              />
              <button type="submit">Subscribe</button>
            </form>
          </section>
        </>
      )}
    </div>
  );
};

export default UserPage;
