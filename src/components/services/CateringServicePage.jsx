import React, { useEffect, useState, useCallback, useRef } from "react";
import "../styles/ui.css"; // unified styles
import { Card, CardContent } from "../ui/Card";
import { motion } from "framer-motion";
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
import Services from "../home/Services";
import FadeInSection from "../FadeInSection";
import Reviews from "../user/Reviews";
import ReviewsLayout from "../user/ReviewsLayout";

const CateringPage = () => {
  const navigate = useNavigate();

  const [videoUrl, setVideoUrl] = useState("");
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

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

  // ===== Fetch hero video =====
  const fetchHeroVideo = useCallback(async () => {
    try {
      const { data } = await axiosCommon.get(
        "/videos/?endpoint=CateringPage&is_active=true"
      );
      if (Array.isArray(data) && data.length > 0) {
        const first = data.find((v) => v.is_featured) || data[0];
        setVideoUrl(first.video_url || first.url?.full || "");
      }
    } catch (err) {
      console.error(err);
      setVideoUrl("");
    }
  }, []);

  useEffect(() => {
    fetchHeroVideo();
  }, [fetchHeroVideo]);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  };

  return (
    <div className="catering-page-container">
      {/* === HERO SECTION === */}
      <section className="catering-banners" aria-label="Hero">
        {videoUrl ? (
          <div className="video-wrapper">
            <video
              ref={videoRef}
              src={videoUrl}
              className="hero-video card"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onError={() => setVideoUrl("")}
            />
            <button
              className="btn btn-secondary mute-button"
              onClick={toggleMute}
              aria-pressed={!isMuted}
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
          className="btn btn-primary"
          onClick={() => navigate("/bookings")}
        >
          Request a Custom Quote
        </motion.button>
      </section>

      {/* === CATERING SERVICES === */}
      <section className="section services-section">
        <h2>Our Catering Services</h2>
        <div className="card-grid">
          {cateringServices.map((service, i) => (
            <motion.div key={i} whileHover={{ scale: 1.03 }}>
              <Card className="card">
                <CardContent>{service}</CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* === EVENT TYPES === */}
      <section className="section event-types-section">
        <h2>We Cater For</h2>
        <div className="card-grid">
          {eventTypes.map((event, i) => (
            <motion.div key={i} whileHover={{ scale: 1.03 }}>
              <Card className="card">
                <CardContent>{event}</CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* === CREATIVE MEDIA === */}
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
              tailored to elevate your event and wow every guest.
            </p>
          </div>
        </div>
      </section>

      {/* === DIETARY OPTIONS === */}
      <section className="section dietary-section">
        <h2>Dietary Options</h2>
        <div className="card-grid">
          {dietarySuggestions.map(({ label, icon }, i) => (
            <motion.div
              key={i}
              className="card dietary-card"
              whileHover={{ scale: 1.08 }}
            >
              <span className="dietary-icon">{icon}</span> {label}
            </motion.div>
          ))}
        </div>
      </section>

      {/* === CLIENT REVIEWS (EethmHome pattern) === */}
      <FadeInSection>
        <ReviewsLayout
          title="What Our Clients Say"
          description="Here’s what people think about our catering services"
        >
          {/* fetch only catering-related reviews; hide review form on this page */}
          <Reviews limit={6} hideForm={true} category="catering" />
        </ReviewsLayout>
      </FadeInSection>

      {/* === OTHER SERVICES === */}
      <section className="section other-services-section">
        <h2>Explore More of Our Services</h2>
        <Services />
      </section>
    </div>
  );
};

export default CateringPage;
