// src/components/user/UserPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { MessageCircle, Sun, Moon } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

import { useProfile } from "../context/ProfileContext";
import apiService from "../../api/apiService";

import BannerCards from "../context/BannerCards";
import MediaCards from "../context/MediaCards";
import FadeInSection from "../FadeInSection";
import ProfileAvatar from "./ProfileAvatar";
import Reviews from "./Reviews";
import NewsletterSignup from "./NewsLetterSignup";

// newly added imports
import VideoGallery from "../videos/VideoGallery";
import GalleryWrapper from "../gallery/GalleryWrapper";

import "./UserPage.css";

const UserPage = () => {
  const { profile, updateProfile } = useProfile();
  const [media, setMedia] = useState([]);
  const [videos, setVideos] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  const navigate = useNavigate();

  // === Utility for consistent payloads ===
  const extractList = (res) => {
    if (!res) return [];
    const payload = res.data ?? res;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.results)) return payload.results;
    if (Array.isArray(payload.data)) return payload.data;
    return [];
  };

  // === Data fetching ===
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        const [mediaRes, reviewsRes, promoRes, videosRes, msgRes] = await Promise.all([
          apiService.media?.user?.({ signal: controller.signal }) ?? { data: [] },
          apiService.reviews?.list?.({ signal: controller.signal }) ?? { data: [] },
          apiService.promotions?.active?.({ signal: controller.signal }) ?? { data: [] },
          apiService.videos?.list?.({ signal: controller.signal }) ?? { data: [] },
          apiService.messages?.unreadCount?.({ signal: controller.signal }) ?? { data: 0 },
        ]);

        setMedia(extractList(mediaRes));
        setReviews(extractList(reviewsRes));
        setPromotions(extractList(promoRes));
        setVideos(extractList(videosRes));
        setUnreadCount(msgRes.data ?? 0);
      } catch (err) {
        if (err?.name !== "CanceledError") {
          console.error("UserPage fetch error:", err);
          toast.error("Error loading your dashboard.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  // === Theme toggle ===
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  // === Featured video ===
  const featuredVideo =
    Array.isArray(videos) &&
    videos.find(
      (item) => (item.is_featured || item.featured) && (item.file || item.url || item.video_url)
    );

  return (
    <div className={`userpage ${darkMode ? "dark" : ""}`}>
      <ToastContainer position="top-center" autoClose={3000} theme="colored" />

      {/* === Header === */}
      <header className="userpage-header glass-card">
        <h2 className="page-title">
          Hey {profile?.name || "Guest"}, welcome back 👋
        </h2>
        <div className="header-actions">
          <button onClick={toggleDarkMode} className="btn-icon" aria-label="Toggle theme">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => navigate("/messaging")} className="btn-icon" aria-label="Messages">
            <MessageCircle size={22} />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>
        </div>
      </header>

      {/* === Profile Summary === */}
      <FadeInSection>
        <div className="profile-summary card" onClick={() => navigate("/account")} tabIndex={0}>
          <ProfileAvatar profile={profile} onProfileUpdate={updateProfile} />
          <div>
            <h3>{profile?.name || "Your Profile"}</h3>
            <p className="subtitle">Build your presence. Explore. Connect.</p>
          </div>
        </div>
      </FadeInSection>

      {/* === Featured Video === */}
      {featuredVideo && (
        <FadeInSection>
          <section className="featured-section card">
            <video
              className="featured-video"
              controls
              preload="metadata"
              src={featuredVideo.file || featuredVideo.video_url || featuredVideo.url}
            />
          </section>
        </FadeInSection>
      )}

      {/* === Video Gallery === */}
      {videos.length > 0 && (
        <FadeInSection>
          <section className="video-gallery-section">
            <h3 className="section-title">🎬 Video Gallery</h3>
            <VideoGallery videos={videos} />
          </section>
        </FadeInSection>
      )}

      {/* === Promotions === */}
      {promotions.length > 0 && (
        <FadeInSection>
          <section className="promo-section">
            <h3 className="section-title">✨ Special Offers</h3>
            <div className="promo-grid">
              {promotions.map((promo) => (
                <div className="promo-card" key={promo.id}>
                  {promo.image_url && (
                    <img src={promo.image_url} alt={promo.title} loading="lazy" />
                  )}
                  <h4>{promo.title}</h4>
                  <p>{promo.description}</p>
                  {promo.discount_percentage && (
                    <span className="discount">Save {promo.discount_percentage}%</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </FadeInSection>
      )}

      {/* === Image / Media Gallery === */}
      <FadeInSection>
        <section className="gallery-section">
          <h3 className="section-title">🖼️ Your Gallery</h3>
          {media.length > 0 ? (
            <GalleryWrapper>
              <div className="gallery-grid">
                {media.map((item, idx) => (
                  <MediaCards key={idx} media={item} />
                ))}
              </div>
            </GalleryWrapper>
          ) : (
            <p className="empty-text">✨ Upload your first media to shine!</p>
          )}
        </section>
      </FadeInSection>

      {/* === Reviews === */}
      <FadeInSection>
        <section className="reviews-section">
          <h3 className="section-title">⭐ Reviews</h3>
          {reviews.length > 0 ? (
            <Reviews reviews={reviews} />
          ) : (
            <p className="empty-text">No reviews yet.</p>
          )}
        </section>
      </FadeInSection>

      {/* === Newsletter Signup === */}
      <FadeInSection>
        <section className="newsletter-section">
          <NewsletterSignup />
        </section>
      </FadeInSection>
    </div>
  );
};

export default UserPage;
