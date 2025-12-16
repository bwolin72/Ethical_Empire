import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import FadeInSection from "../FadeInSection";
import Services from "../services/Services";
import NewsletterSignup from "../user/NewsLetterSignup";
import BannerCards from "../context/BannerCards";
import MediaCard from "../context/MediaCards";
import MediaSkeleton from "../context/MediaSkeleton";
import useFetcher from "../../hooks/useFetcher";
import Reviews from "../user/Reviews";
import ReviewsLayout from "../user/ReviewsLayout";

import { 
  ArrowRight, 
  Play, 
  Music, 
  Camera, 
  Palette, 
  Utensils,
  Sparkles,
  Star,
  CheckCircle
} from "lucide-react";

import "./EethmHome.css";

// --- Helpers ---
const toArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

const getMediaUrl = (media) => {
  const candidates = [
    media?.secure_url,
    media?.url?.full,
    media?.url,
    media?.video_url,
    media?.video_file,
    media?.file_url,
    media?.file,
    media?.src,
    media?.path,
  ];
  const found = candidates.find((c) => typeof c === "string" && c.trim() !== "");
  if (!found && media?.public_id && media?.cloud_name) {
    return `https://res.cloudinary.com/${media.cloud_name}/image/upload/${media.public_id}`;
  }
  return found || "";
};

const EethmHome = () => {
  const navigate = useNavigate();
  const [showNewsletterForm, setShowNewsletterForm] = useState(false);

  // --- Fetch hero videos and media cards ---
  const { data: videosRaw, loading: videoLoading } = useFetcher(
    "videos",
    "home",
    { is_active: true },
    { resource: "videos" }
  );

  const { data: mediaCardsRaw, loading: mediaLoading } = useFetcher(
    "media",
    "home",
    { is_active: true },
    { resource: "media" }
  );

  const [videoUrl, setVideoUrl] = useState(null);
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const videos = toArray(videosRaw);
    if (!videos.length && !videoLoading) return setVideoUrl(null);
    const featured = videos.find((v) => v?.is_featured) ?? videos[0];
    setVideoUrl(getMediaUrl(featured) || null);
  }, [videosRaw, videoLoading]);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  };

  const mediaCards = toArray(mediaCardsRaw);

  // Feature cards for services preview
  const serviceFeatures = [
    {
      icon: <Music size={32} />,
      title: "Live Band & Entertainment",
      description: "Energetic performances for weddings, corporate events & festivals",
      theme: "live-band",
      link: "/services/live-band"
    },
    {
      icon: <Camera size={32} />,
      title: "Multimedia Production",
      description: "Professional photography, videography & audio-visual services",
      theme: "multimedia",
      link: "/services/media-hosting"
    },
    {
      icon: <Palette size={32} />,
      title: "Event Decor & Styling",
      description: "Elegant themes, floral arrangements & venue transformations",
      theme: "decor",
      link: "/services/decor"
    },
    {
      icon: <Utensils size={32} />,
      title: "Catering Services",
      description: "Local & international cuisine for all occasions",
      theme: "catering",
      link: "/services/catering"
    },
  ];

  const benefits = [
    "Professional Equipment & Crew",
    "Customizable Packages",
    "Across Ghana & West Africa",
    "24/7 Support & Coordination",
    "Insurance & Safety Compliant",
    "Client-First Approach"
  ];

  return (
    <div className="eethm-home-page">
      {/* === HERO SECTION === */}
      <section className="video-hero-section">
        {videoUrl && !videoLoading ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              className="background-video"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="auto"
            />
            <div className="overlay-gradient" />
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="hero-badge">
                <Sparkles size={16} />
                <span>Premium Event Services</span>
              </div>
              <h1 className="hero-title">
                Crafting <span className="highlight">Unforgettable</span> Experiences
              </h1>
              <p className="hero-subtitle">
                Professional multimedia, catering, decor, and live entertainment services across Ghana
              </p>
              <div className="hero-buttons">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/bookings")}
                >
                  <Play size={18} />
                  Book Now
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate("/services")}
                >
                  <ArrowRight size={18} />
                  Explore Services
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setShowNewsletterForm(true)}
                >
                  Subscribe
                </button>
              </div>
            </motion.div>
            <button
              className="mute-button"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
          </>
        ) : (
          <BannerCards endpoint="home" title="Highlights" loading={videoLoading} />
        )}
      </section>

      {/* === FEATURED SERVICES === */}
      <FadeInSection>
        <section className="section featured-services-section">
          <div className="section-header">
            <div className="section-badge">
              <Star size={16} />
              <span>Our Expertise</span>
            </div>
            <h2 className="section-title">Premium Event Solutions</h2>
            <p className="section-description">
              Comprehensive services designed to bring your vision to life with professionalism and creativity
            </p>
          </div>
          
          <div className="features-grid">
            {serviceFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className={`feature-card theme-${feature.theme}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                onClick={() => navigate(feature.link)}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <button className="feature-link">
                  Learn More <ArrowRight size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </section>
      </FadeInSection>

      {/* === WHY CHOOSE US === */}
      <FadeInSection>
        <section className="section benefits-section">
          <div className="benefits-container">
            <motion.div 
              className="benefits-content"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <h2 className="section-title">Why Choose EETHM_GH</h2>
              <p className="benefits-description">
                We combine technical excellence with creative vision to deliver seamless event experiences that exceed expectations.
              </p>
              
              <div className="benefits-list">
                {benefits.map((benefit, index) => (
                  <div key={index} className="benefit-item">
                    <CheckCircle className="benefit-icon" size={20} />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              
              <button className="btn btn-primary" onClick={() => navigate("/about")}>
                Learn More About Us
              </button>
            </motion.div>
            
            <motion.div 
              className="benefits-image"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              {/* This would be an actual image, using placeholder for now */}
              <div className="image-placeholder">
                <div className="image-overlay">
                  <h3>Professional Event Management</h3>
                  <p>From concept to completion</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </FadeInSection>

      {/* === SERVICES PREVIEW === */}
      <FadeInSection>
        <section className="section services-section">
          <div className="section-header">
            <div className="section-badge">
              <Sparkles size={16} />
              <span>Complete Solutions</span>
            </div>
            <h2 className="section-title">Our Professional Services</h2>
            <p className="section-description">
              Explore our comprehensive range of event and multimedia services
            </p>
          </div>
          
          <div className="services-preview">
            <Services />
          </div>
          
          <div className="section-cta">
            <button className="btn btn-primary" onClick={() => navigate("/services")}>
              View All Services
            </button>
          </div>
        </section>
      </FadeInSection>

      {/* === MEDIA GALLERY === */}
      <FadeInSection>
        <section className="section gallery-section">
          <div className="section-header">
            <h2 className="section-title">Recent Projects & Events</h2>
            <p className="section-description">
              A glimpse into our work and successful events
            </p>
          </div>
          
          <div className="gallery-grid">
            {mediaLoading
              ? Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />)
              : mediaCards.length > 0 ? (
                  mediaCards.slice(0, 8).map((media, idx) => (
                    <MediaCard
                      key={media.id ?? media._id ?? idx}
                      media={media}
                    />
                  ))
                ) : (
                  <div className="empty-gallery">
                    <p>No media available at the moment.</p>
                  </div>
                )}
          </div>
        </section>
      </FadeInSection>

      {/* === REVIEWS === */}
      <FadeInSection>
        <section className="section reviews-section">
          <ReviewsLayout
            title="Client Testimonials"
            description="Hear from people who've experienced the EETHM difference"
          >
            <Reviews limit={6} hideForm />
          </ReviewsLayout>
        </section>
      </FadeInSection>

      {/* === CTA SECTION === */}
      <FadeInSection>
        <section className="section cta-section">
          <div className="cta-content">
            <h2>Ready to Create Something Amazing?</h2>
            <p>
              Contact us today to discuss your event needs and let's bring your vision to life
            </p>
            <div className="cta-buttons">
              <button className="btn btn-primary" onClick={() => navigate("/contact")}>
                Get In Touch
              </button>
              <button className="btn btn-secondary" onClick={() => navigate("/bookings")}>
                Book a Service
              </button>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* === NEWSLETTER MODAL === */}
      {showNewsletterForm && (
        <div
          className="newsletter-modal-backdrop"
          onClick={() => setShowNewsletterForm(false)}
        >
          <div
            className="newsletter-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <button
              className="newsletter-close-btn"
              onClick={() => setShowNewsletterForm(false)}
            >
              &times;
            </button>
            <div className="newsletter-modal-content">
              <h3>Stay Updated</h3>
              <p>Subscribe to our newsletter for exclusive offers and event tips.</p>
              <NewsletterSignup onSuccess={() => setShowNewsletterForm(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EethmHome;
