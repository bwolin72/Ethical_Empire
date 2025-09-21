// frontend/src/components/pages/CateringPage.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import "./catering.custom.css";
import { Card, CardContent } from "../ui/Card";
import { motion } from "framer-motion";
import publicAxios from "../../api/publicAxios";
import axiosCommon from "../../api/axiosCommon";
import MediaCards from "../context/MediaCards";
import BannerCards from "../context/BannerCards";
import { useNavigate } from "react-router-dom";
import {
  FaLeaf,
  FaPepperHot,
  FaCarrot,
  FaFish,
  FaDrumstickBite,
  FaAppleAlt,
  FaSeedling,
} from "react-icons/fa";
import Services from "../home/Services"; // ✅ reuse global Services

const CateringPage = () => {
  const navigate = useNavigate();

  // ------------------ State ------------------
  const [testimonials, setTestimonials] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [videoUrl, setVideoUrl] = useState(""); // hero video (if any)
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  // ------------------ Static Data ------------------
  const cateringServices = [
    "Traditional Ghanaian Buffet",
    "Continental Plated Meals",
    "Chop Bar Style (Local Experience)",
    "Western Canapés & Cocktails",
    "Live Grill Station (Kebab, Suya, Chicken)",
    "Luxury Wedding Banquet Service",
  ];

  const dietarySuggestions = [
    { label: "Vegan Waakye", icon: <FaLeaf /> },
    { label: "Keto Banku", icon: <FaPepperHot /> },
    { label: "Gluten-Free Fufu", icon: <FaCarrot /> },
    { label: "Low Carb Jollof", icon: <FaSeedling /> },
    { label: "Dairy-Free Stew", icon: <FaAppleAlt /> },
    { label: "Nut-Free Soup", icon: <FaFish /> },
    { label: "Halal Grill", icon: <FaDrumstickBite /> },
    { label: "Kosher Platter", icon: <FaFish /> },
    { label: "Vegetarian Jollof", icon: <FaLeaf /> },
    { label: "Paleo Plantain Mix", icon: <FaCarrot /> },
    { label: "Organic Yam Chips", icon: <FaAppleAlt /> },
    { label: "Diabetic-Friendly Tilapia", icon: <FaFish /> },
  ];

  const eventTypes = [
    "Weddings",
    "Corporate Galas",
    "Private Dinners",
    "Product Launches",
    "Birthday Soirées",
    "Cocktail Receptions",
  ];

  // ------------------ Data Fetching ------------------
  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const { data } = await publicAxios.get("/reviews/");
      setTestimonials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading reviews:", err);
      setTestimonials([]);
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  const fetchHeroVideo = useCallback(async () => {
    try {
      const { data } = await axiosCommon.get(
        "/videos/?endpoint=CateringPage&is_active=true"
      );
      if (Array.isArray(data) && data.length > 0) {
        const first = data.find((v) => v?.is_featured) ?? data[0];
        // try the most common video field names
        setVideoUrl(first.video_url || first.url?.full || "");
      } else {
        setVideoUrl("");
      }
    } catch (err) {
      console.error("Video fetch error:", err);
      setVideoUrl("");
    }
  }, []);

  useEffect(() => {
    fetchReviews();
    fetchHeroVideo();
  }, [fetchReviews, fetchHeroVideo]);

  // ------------------ UI Helpers ------------------
  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) {
        try {
          videoRef.current.muted = next;
        } catch (_) {}
      }
      return next;
    });
  };

  // ------------------ Render ------------------
  return (
    <div className="catering-page-container">
      {/* === Hero Section: Video or Banner === */}
      <section className="catering-banners" aria-label="Hero">
        {videoUrl ? (
          <div className="video-wrapper">
            <video
              ref={videoRef}
              src={videoUrl}
              className="hero-video"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onError={() => {
                console.warn("Hero video failed to load, falling back to BannerCards");
                setVideoUrl("");
              }}
            />
            <button
              className="mute-button"
              onClick={toggleMute}
              aria-pressed={!isMuted}
              aria-label={isMuted ? "Unmute background video" : "Mute background video"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
          </div>
        ) : (
          <BannerCards endpoint="CateringPage" title="Catering Highlights" />
        )}
      </section>

      {/* === CTA === */}
      <section className="cta-section">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="cta-button"
          onClick={() => navigate("/bookings")}
        >
          Request a Custom Quote
        </motion.button>
      </section>

      {/* === Catering Services === */}
      <section className="section services-section">
        <h2>Our Catering Services</h2>
        <div className="card-grid">
          {cateringServices.map((service, i) => (
            <motion.div key={i} whileHover={{ scale: 1.03 }}>
              <Card className="card">
                <CardContent className="card-content">{service}</CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* === Event Types === */}
      <section className="section event-types-section">
        <h2>We Cater For</h2>
        <div className="card-grid">
          {eventTypes.map((event, i) => (
            <motion.div key={i} whileHover={{ scale: 1.03 }}>
              <Card className="card">
                <CardContent className="card-content">{event}</CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* === Creative Catering Media === */}
      <section className="section creative-section">
        <div className="creative-layout">
          <div className="creative-media">
            <MediaCards
              endpoint="CateringPage"
              type="media"
              title="Creative Catering Ideas"
              isFeatured
              isActive
            />
          </div>
          <div className="creative-text">
            <h3>Creative Catering Ideas</h3>
            <p>
              We blend Ghanaian heritage with Western flair to deliver diverse,
              mouthwatering culinary experiences. From live jollof bars and suya
              grills to cocktail canapé platters, our fusion offerings are
              tailored to elevate your event and wow every guest—local or
              international.
            </p>
          </div>
        </div>
      </section>

      {/* === Dietary Options === */}
      <section className="section dietary-section">
        <h2>Dietary Options</h2>
        <div className="dietary-grid">
          {dietarySuggestions.map(({ label, icon }, i) => (
            <motion.div
              key={i}
              className="dietary-card"
              whileHover={{ scale: 1.08 }}
            >
              <span className="dietary-icon">{icon}</span>
              {label}
            </motion.div>
          ))}
        </div>
      </section>

      {/* === Testimonials === */}
      <section className="section testimonial-section" aria-live="polite">
        <h2>What Clients Say</h2>
        <div className="testimonial-grid">
          {loadingReviews
            ? [...Array(3)].map((_, i) => (
                <div key={i} className="testimonial-card skeleton shimmer">
                  <div className="testimonial-message">Loading review...</div>
                  <div className="testimonial-user">Loading...</div>
                </div>
              ))
            : testimonials.slice(0, 6).map((review, i) => (
                <motion.div key={review?.id || i} whileHover={{ scale: 1.02 }}>
                  <Card className="testimonial-card">
                    <CardContent>
                      <p className="testimonial-text">
                        "{review.message || "No message provided."}"
                      </p>
                      <p className="testimonial-user">
                        — {review.user?.username || "Anonymous"}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
        </div>
      </section>

      {/* === Other Services === */}
      <section className="section other-services-section">
        <h2>Explore More of Our Services</h2>
        <Services />
      </section>
    </div>
  );
};

export default CateringPage;
