import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { MessageCircle, Bell, Star, Sun, Moon } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

import { useProfile } from "../context/ProfileContext";
import apiService from "../../api/apiService";

import BannerCards from "../context/BannerCards";
import MediaCards from "../context/MediaCards";
import FadeInSection from "../FadeInSection";
import ProfileAvatar from "./ProfileAvatar";
import Reviews from "./Reviews";
import NewsletterSignup from "./NewsLetterSignup";

import "./UserPage.css";

const UserPage = () => {
  const { profile, updateProfile } = useProfile();
  const [media, setMedia] = useState([]);
  const [videos, setVideos] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();

  const extractList = (res) => {
    if (!res) return [];
    const payload = res.data ?? res;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.results)) return payload.results;
    if (Array.isArray(payload.data)) return payload.data;
    return [];
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      try {
        const [mediaRes, reviewsRes, promoRes, videosRes, messagesRes] = await Promise.all([
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
        setUnreadCount(messagesRes.data ?? 0);
      } catch (err) {
        if (err?.name !== "CanceledError") {
          console.error("❌ UserPage load error:", err);
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
    Array.isArray(videos) &&
    videos.find((item) => (item.is_featured || item.featured) && (item.file || item.url || item.video_url));

  const services = [
    { title: "Live Band", desc: "Experience live music with Asaase Band.", icon: "🎸" },
    { title: "Catering", desc: "Delicious catering for your events.", icon: "🍽️" },
    { title: "Decor", desc: "Beautiful event decorations.", icon: "🎉" },
    { title: "Photography", desc: "Capture memories with our photographers.", icon: "📸" },
    { title: "Lighting", desc: "Professional lighting setup.", icon: "💡" },
    { title: "Sound", desc: "High-quality sound systems.", icon: "🔊" },
  ];

  return (
    <div className={`userpage-container ${darkMode ? "dark" : ""}`}>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar theme="colored" />

      {/* === Header === */}
      <header className="userpage-header glass">
        <h2>Hey {profile?.name || "Guest"}, welcome back 👋</h2>
        <div className="header-actions">
          <button onClick={toggleDarkMode} className="dark-toggle" aria-label="Toggle dark mode">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => navigate("/messaging")}
            className="profile-icon"
            aria-label="Messages"
          >
            <MessageCircle size={22} />
            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
          </button>
        </div>
      </header>

      {/* === Profile Section === */}
      <FadeInSection>
        <div className="profile-summary" role="button" onClick={() => navigate("/account")} tabIndex={0}>
          <ProfileAvatar profile={profile} onProfileUpdate={updateProfile} />
          <div>
            <h3>{profile?.name || "Your Profile"}</h3>
            <p className="tagline">Build your presence. Explore. Connect.</p>
          </div>
        </div>
      </FadeInSection>

      {/* === Progress / Engagement Bar === */}
      <FadeInSection>
        <div className="engagement-bar">
          <div className="progress">
            <div className="fill" style={{ width: `${Math.min((reviews.length / 5) * 100, 100)}%` }}></div>
          </div>
          <p>{reviews.length}/5 Reviews — Earn your first badge!</p>
        </div>
      </FadeInSection>

      {/* === Featured Video === */}
      {featuredVideo && (
        <FadeInSection>
          <section className="featured-section">
            <video controls className="featured-video" preload="metadata">
              <source src={featuredVideo.file || featuredVideo.video_url || featuredVideo.url} type="video/mp4" />
            </video>
          </section>
        </FadeInSection>
      )}

      {/* === Services === */}
      <FadeInSection>
        <section>
          <h3>Our Services</h3>
          <div className="services-grid">
            {services.map((s, i) => (
              <div className="service-card" key={i}>
                <span className="icon">{s.icon}</span>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeInSection>

      {/* === Promotions === */}
      {promotions.length > 0 && (
        <FadeInSection>
          <section className="promo-section">
            <h3>Special Offers</h3>
            <div className="promotions-grid">
              {promotions.map((promo) => (
                <div className="promo-card" key={promo.id}>
                  {promo.image_url && <img src={promo.image_url} alt={promo.title} loading="lazy" />}
                  <h4>{promo.title}</h4>
                  <p>{promo.description}</p>
                  {promo.discount_percentage && (
                    <p className="promo-discount">Save {promo.discount_percentage}%</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </FadeInSection>
      )}

      {/* === Media Gallery === */}
      <FadeInSection>
        <section>
          <h3>Your Gallery</h3>
          {media.length > 0 ? (
            <div className="gallery-grid">
              {media.map((item, idx) => (
                <MediaCards key={idx} media={item} />
              ))}
            </div>
          ) : (
            <p className="empty-text">Upload your first media and show your vibe 🌟</p>
          )}
        </section>
      </FadeInSection>

      {/* === Reviews === */}
      <FadeInSection>
        {reviews.length > 0 ? <Reviews reviews={reviews} /> : <p className="empty-text">No reviews yet.</p>}
      </FadeInSection>

      {/* === Newsletter === */}
      <FadeInSection>
        <section className="newsletter-cta">
          <h3>Stay in the Loop</h3>
          <p>Get exclusive updates, artist features, and special offers.</p>
          <button className="btn-accent" onClick={() => navigate("/newsletter")}>
            📩 Join Newsletter
          </button>
        </section>
      </FadeInSection>

      {/* === Follow Section === */}
      <FadeInSection>
        <section className="follow-us">
          <h4>Follow & Connect</h4>
          <div className="social-buttons">
            <button className="social-btn">Instagram</button>
            <button className="social-btn">Twitter</button>
            <button className="social-btn">YouTube</button>
          </div>
        </section>
      </FadeInSection>
    </div>
  );
};

export default UserPage;
