import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
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

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          profileRes,
          mediaRes,
          featuredRes,
          reviewsRes,
          promoRes,
          videosRes,
        ] = await Promise.all([
          axiosInstance.get("/accounts/profile/", { signal }),
          axiosInstance.get("/media/", {
            params: { type: "media", endpoint: "UserPage", is_active: true },
            signal,
          }),
          axiosInstance.get("/media/featured/?endpoint=UserPage", { signal }),
          axiosInstance.get("/reviews/", { signal }),
          axiosInstance.get("/promotions/", { signal }),
          axiosInstance.get("/api/videos/?endpoint=UserPage", { signal }),
        ]);

        setProfile(profileRes.data);
        setMedia(mediaRes.data?.results || []);
        setReviews(reviewsRes.data || []);
        setPromotions(promoRes.data || []);
        setVideos(videosRes.data?.results || []);
      } catch (err) {
        toast.error("Error loading data. Please try again.");
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
      await axiosInstance.post("/newsletter/subscribe/", { email: subscriberEmail });
      toast.success("Subscribed! Please check your email to confirm.");
      setSubscriberEmail("");
    } catch {
      toast.error("Subscription failed. Try again.");
    }
  };

  const featuredVideo = Array.isArray(videos)
    ? videos.find((item) => item.file?.endsWith(".mp4") && item.is_featured)
    : null;

  return (
    <div className={`userpage-container ${darkMode ? "dark" : ""}`}>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar theme="colored" />

      <header className="userpage-header">
        <h2>Welcome {profile?.name || "Ethical Empire"}</h2>
        <div className="header-right">
          <button onClick={toggleDarkMode} className="dark-toggle">
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      <FadeInSection>
        <div
          className="avatar-section"
          onClick={() => navigate("/account")}
          style={{ cursor: "pointer", textAlign: "center" }}
        >
          <ProfileAvatar profile={profile} />
          <p className="open-profile-link">
            {profile?.avatar ? "Change Profile" : "Set Up Profile"}
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
                  <source src={featuredVideo.file} type="video/mp4" />
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

          {promotions.length > 0 && (
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
                      <small>- {r.user_email || "Anonymous"}</small>
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
