import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import axiosCommon from "../../api/axiosCommon";
import { useNavigate } from "react-router-dom";

import MediaCards from "../context/MediaCards";
import BannerCards from "../context/BannerCards";
import Reviews from "../user/Reviews";
import ReviewsLayout from "../user/ReviewsLayout";
import FadeInSection from "../FadeInSection";
import ServiceCategory from "./ServiceCategory";

import {
  FaLeaf,
  FaPepperHot,
  FaCarrot,
  FaFish,
  FaDrumstickBite,
  FaAppleAlt,
  FaSeedling,
} from "react-icons/fa";

import "./catering.custom.css";

const CateringPage = () => {
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState("");
  const [services, setServices] = useState([]);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const eventTypes = [
    "Weddings",
    "Corporate Galas",
    "Private Dinners",
    "Product Launches",
    "Birthday Soirées",
    "Cocktail Receptions",
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
  ];

  // === Fetch hero video ===
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

  // === Fetch Catering Services dynamically ===
  const fetchCateringServices = useCallback(async () => {
    try {
      const { data } = await axiosCommon.get(
        "/services/?category=Catering&is_active=true"
      );
      if (Array.isArray(data)) setServices(data);
    } catch (error) {
      console.error("Error fetching catering services:", error);
    }
  }, []);

  useEffect(() => {
    fetchHeroVideo();
    fetchCateringServices();
  }, [fetchHeroVideo, fetchCateringServices]);

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
      <section className="catering-hero">
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
              onError={() => setVideoUrl("")}
            />
            <div className="overlay" />
            <div className="hero-content">
              <h1 className="hero-title">Catering Services</h1>
              <p className="hero-subtitle">
                Exquisite meals crafted for every occasion — from local Ghanaian
                delicacies to continental cuisine.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="btn btn-primary"
                onClick={() => navigate("/bookings")}
              >
                Request a Custom Quote
              </motion.button>
            </div>
            <button
              className="mute-button"
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

      {/* === OUR CATERING SERVICES === */}
      <section className="section services-section">
        <h2 className="section-title">Our Catering Services</h2>
        {services.length > 0 ? (
          <ServiceCategory
            category={{
              title: "Catering",
              services: services.map((srv) => ({
                name: srv.title,
                description: srv.description,
                icon: srv.icon || FaLeaf,
              })),
            }}
          />
        ) : (
          <p className="loading-text">Loading catering services...</p>
        )}
      </section>

      {/* === EVENT TYPES === */}
      <section className="section event-types-section">
        <h2 className="section-title">We Cater For</h2>
        <div className="event-grid">
          {eventTypes.map((event, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="event-card"
            >
              {event}
            </motion.div>
          ))}
        </div>
      </section>

      {/* === CREATIVE CATERING IDEAS === */}
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
              grills to cocktail canapé platters, our fusion offerings elevate
              your event and delight every guest.
            </p>
          </div>
        </div>
      </section>

      {/* === DIETARY OPTIONS === */}
      <section className="section dietary-section">
        <h2 className="section-title">Dietary Options</h2>
        <div className="dietary-grid">
          {dietarySuggestions.map(({ label, icon }, i) => (
            <motion.div
              key={i}
              className="dietary-card"
              whileHover={{ scale: 1.08 }}
            >
              <span className="dietary-icon">{icon}</span>
              <span>{label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* === CLIENT REVIEWS === */}
      <FadeInSection>
        <ReviewsLayout
          title="What Our Clients Say"
          description="Here’s what people think about our catering services"
        >
          <Reviews limit={6} hideForm={true} category="catering" />
        </ReviewsLayout>
      </FadeInSection>

      {/* === OTHER SERVICES === */}
      <section className="section other-services-section">
        <h2 className="section-title">Explore More of Our Services</h2>
        <ServiceCategory
          category={{
            title: "Other Services",
            services: [
              { name: "Event Decor", description: "Beautiful setups and floral designs." },
              { name: "Live Band", description: "Professional live music for your events." },
              { name: "Lighting", description: "Stage and ambient lighting setups." },
            ],
          }}
        />
      </section>
    </div>
  );
};

export default CateringPage;
