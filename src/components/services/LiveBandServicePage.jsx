// src/components/services/LiveBandServicePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import VideoGallery from "../videos/VideoGallery";
import MediaCards from "../context/MediaCards";
import apiService from "../../api/apiService";

import "./liveband.css";

// --- Animation Variants ---
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08 },
  }),
};

// --- Helpers ---
const asArray = (res) => {
  if (!res) return [];
  const data = res?.data ?? res;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const safeFetch = async (fn) => {
  try {
    const res = await fn();
    return asArray(res);
  } catch (err) {
    console.error(err);
    return [];
  }
};

const FALLBACK_VIDEO = "/videos/liveband-fallback.mp4";

const LiveBandServicePage = () => {
  const navigate = useNavigate();

  const [heroVideo, setHeroVideo] = useState(FALLBACK_VIDEO);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // --- Fetch hero video + reviews ---
  useEffect(() => {
    let active = true;

    const fetchContent = async () => {
      setLoading(true);
      try {
        const [videosData, reviewsData] = await Promise.all([
          safeFetch(() =>
            apiService.getVideos({ endpoint: "LiveBandServicePage", is_active: true })
          ),
          safeFetch(apiService.getReviews),
        ]);

        // Hero video
        const featuredVideo = videosData.find((v) => v?.is_featured) || videosData[0];
        const videoUrl = featuredVideo?.video_file || featuredVideo?.video_url || FALLBACK_VIDEO;
        if (active) setHeroVideo(videoUrl);

        // Testimonials normalization
        const normalizedReviews = reviewsData.map((r) => ({
          id: r.id ?? r._id,
          text: r.comment ?? r.message ?? r.text ?? "",
          author:
            r.user?.username ?? r.reviewer_name ?? r.name ?? "Anonymous",
        }));
        if (active) setTestimonials(normalizedReviews);
      } catch (err) {
        console.error("Failed to fetch live band content:", err);
        if (active) setErrorMsg("Failed to load reviews or video.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchContent();
    return () => { active = false; };
  }, []);

  return (
    <div className="liveband-page">
      {/* === Hero Section === */}
      <section className="banner-section">
        <VideoGallery
          videos={[{ url: heroVideo }]}
          fallbackVideo={FALLBACK_VIDEO}
          showHero
          autoPlay
          loop
          allowMuteToggle
          title="Experience the Rhythm of Elegance"
          subtitle="Professional Live Bands for Unforgettable Events"
          actions={[
            { label: "Book a Live Band", onClick: () => navigate("/bookings"), className: "btn-primary" },
          ]}
        />
      </section>

      {/* === Highlights Section === */}
      <section className="section highlights-section">
        <h2 className="section-title">Why Choose Our Live Band?</h2>
        <div className="highlight-grid">
          {[
            { icon: "🎤", title: "Professional Vocalists", text: "Talented singers who adapt to any genre." },
            { icon: "🎸", title: "Versatile Repertoire", text: "From Afrobeat & Highlife to Jazz, Gospel & Reggae." },
            { icon: "🥁", title: "Dynamic Presence", text: "Energy that keeps your guests entertained all night." },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              custom={index}
              viewport={{ once: true }}
              className="highlight-card"
            >
              <div className="highlight-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* === Creative Preview Section === */}
      <section className="section creative-section">
        <div className="creative-layout">
          <div className="creative-text">
            <h3 className="section-subtitle">Immersive Musical Moments</h3>
            <p className="section-description">
              Our live bands deliver timeless melodies and unmatched ambiance that elevate any event.
            </p>
          </div>
          <div className="creative-media">
            <MediaCards endpoint="LiveBandServicePage" fullWidth={false} title="" />
          </div>
        </div>
      </section>

      {/* === Testimonials Section === */}
      <section className="section testimonial-section" aria-live="polite">
        <h2 className="section-title">Client Reviews</h2>
        <div className="testimonial-grid">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="testimonial-card shimmer" />
            ))
          ) : errorMsg ? (
            <p className="section-description center-text">{errorMsg}</p>
          ) : testimonials.length > 0 ? (
            testimonials.slice(0, 6).map((review, index) => (
              <motion.div
                key={review.id ?? index}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                custom={index}
                viewport={{ once: true }}
              >
                <div className="testimonial-card">
                  <p className="testimonial-text">"{review.text}"</p>
                  <p className="testimonial-user">— {review.author}</p>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="section-description center-text">No client reviews available yet.</p>
          )}
        </div>
      </section>

      {/* === Full Media Gallery === */}
      <section className="section media-gallery-section">
        <h2 className="section-title">Full Gallery</h2>
        <MediaCards endpoint="LiveBandServicePage" fullWidth={true} title="" />
      </section>

      {/* === Final CTA === */}
      <section className="section final-cta">
        <h2 className="section-title">Make Your Event Unforgettable</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="cta-button"
          onClick={() => navigate("/bookings")}
        >
          Book the Live Band Today
        </motion.button>
      </section>
    </div>
  );
};

export default LiveBandServicePage;
