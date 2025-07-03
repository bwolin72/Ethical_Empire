import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
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
  const [promotions, setPromotions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [featuredVideo, setFeaturedVideo] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    Promise.allSettled([
      axiosInstance.get("/accounts/profiles/profile/"),
      axiosInstance.get("/media/"),
      axiosInstance.get("/media/featured/"),
      axiosInstance.get("/reviews/"),
      axiosInstance.get("/promotions/")
    ])
      .then(([profileRes, mediaRes, featuredRes, reviewsRes, promoRes]) => {
        if (profileRes.status === "fulfilled") {
          setProfile(profileRes.value.data);
        } else {
          toast.error("Failed to load profile.");
        }

        if (mediaRes.status === "fulfilled") {
          setMedia(mediaRes.value.data);
        } else {
          toast.error("Failed to load media.");
        }

        if (featuredRes.status === "fulfilled") {
          setFeaturedVideo(featuredRes.value.data);
        }

        if (reviewsRes.status === "fulfilled") {
          setReviews(reviewsRes.value.data);
        } else {
          toast.error("Failed to load reviews.");
        }

        if (promoRes.status === "fulfilled") {
          setPromotions(promoRes.value.data);
        }
      })
      .catch(() => toast.error("Something went wrong loading the user page."))
      .finally(() => setLoading(false));
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  return (
    <div className={`userpage-container ${darkMode ? "dark" : ""}`}>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar theme="colored" />

      <header className="userpage-header">
        <h2>Welcome {profile?.full_name || "Ethical Empire"}</h2>
        <div className="header-right">
          <button onClick={toggleDarkMode} className="dark-toggle">
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button
            className="profile-icon"
            title="Account Settings"
            onClick={() => navigate("/account")}
          >
            👤
          </button>
        </div>
      </header>

      <p className="intro-text">Presenting Asaase Band</p>

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : (
        <>
          {/* Featured Video */}
          {featuredVideo?.url ? (
            <div className="asaase-card">
              <video controls width="100%" preload="metadata">
                <source src={featuredVideo.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <p className="empty-text">No featured video available.</p>
          )}

          {/* Promotions */}
          {promotions.length > 0 && (
            <section>
              <h3>Special Offers</h3>
              <div className="promotions-grid">
                {promotions.map((promo) => (
                  <div key={promo.id} className="promo-card fade-in">
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
                ))}
              </div>
            </section>
          )}

          {/* Services */}
          <section>
            <h3>Our Services</h3>
            <div className="services-grid">
              {services.map((s, i) => (
                <div key={i} className="service-card fade-in">
                  <div className="icon">{s.icon}</div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Media Gallery */}
          <section>
            <h3>Your Media Gallery</h3>
            <div className="gallery-grid">
              {media.filter(item => item.type !== "banner").length > 0 ? (
                media
                  .filter(item => item.type !== "banner")
                  .map((item, idx) => (
                    <div key={idx} className="gallery-item fade-in">
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt="Gallery"
                          loading="lazy"
                          onError={(e) => (e.target.src = "/fallback.jpg")}
                        />
                      ) : (
                        <video controls preload="metadata">
                          <source src={item.url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  ))
              ) : (
                <p className="empty-text">No media to display.</p>
              )}
            </div>
          </section>

          {/* Reviews */}
          <section>
            <h3>Client Reviews</h3>
            <div className="reviews-list">
              {reviews.length > 0 ? (
                reviews.map((r, i) => (
                  <div key={i} className="review-card fade-in">
                    <p>"{r.comment}"</p>
                    <small>- {r.user_email || "Anonymous"}</small>
                    {r.reply && (
                      <div className="review-reply">
                        <strong>Admin Reply:</strong> <p>{r.reply}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="empty-text">No reviews yet.</p>
              )}
              <button className="review-btn" onClick={() => navigate("/account#reviews")}>
                Write a Review
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default UserPage;
