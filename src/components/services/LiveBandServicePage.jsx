import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import serviceService from "../../api/services/serviceService";
import videoService from "../../api/services/videoService";
import mediaService from "../../api/services/mediaService";

import BannerCards from "../context/BannerCards";
import VideoGallery from "../videos/VideoGallery";
import MediaCard from "../context/MediaCards";
import MediaSkeleton from "../context/MediaSkeleton";
import ServiceCategory from "./ServiceCategory";
import ReviewsLayout from "../user/ReviewsLayout";
import Reviews from "../user/Reviews";

import corporateImg from "../../assets/liveband/corporate-performance.png";
import weddingImg from "../../assets/liveband/wedding-band.png";
import festivalImg from "../../assets/liveband/festival-band.png";
import heroFallback from "../../assets/liveband/liveband-hero.jpg";

import "./liveband.css";

/* ---------- Animations ---------- */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const zoomIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function LiveBandServicePage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoUrl, setVideoUrl] = useState(null);

  const [services, setServices] = useState([]);
  const [otherServices, setOtherServices] = useState([]);
  const [banners, setBanners] = useState([]);
  const [videos, setVideos] = useState([]);
  const [mediaCards, setMediaCards] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- Fetch Services, Videos & Media ---------- */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all in parallel
      const [
        livebandRes,
        allRes,
        bannerRes,
        videoData,
        mediaData
      ] = await Promise.all([
        serviceService.getServicesByCategory("Live Band"),
        serviceService.getServices(),
        mediaService.bannerActive({ endpoint: "LiveBandServicePage" }),
        videoService.getLiveBand(),
        mediaService.mediaActive({ endpoint: "LiveBandServicePage" }),
      ]);

      // --- Extract Data ---
      const livebandData = Array.isArray(livebandRes.data?.results) ? livebandRes.data.results : [];
      const allData = Array.isArray(allRes.data?.results) ? allRes.data.results : [];
      const bannerItems = bannerRes.data?.results || [];
      const mediaItems = mediaData.data?.results || [];

      // --- Set State ---
      setServices(livebandData);
      setOtherServices(allData.filter((s) => s.category !== "Live Band"));
      setBanners(bannerItems);
      setVideos(videoData);
      setMediaCards(mediaItems);
    } catch (err) {
      console.error("Error loading Live Band data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---------- Featured Video ---------- */
  useEffect(() => {
    if (!videos?.length) return setVideoUrl(null);

    const featured = videos.find((v) => v.isFeatured) || videos[0];
    const url = featured?.videoUrl || null;
    setVideoUrl(url);
  }, [videos]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  }, []);

  const scrollToGallery = () =>
    document.querySelector(".gallery-section")?.scrollIntoView({ behavior: "smooth" });

  /* ---------- Static Service Sections ---------- */
  const staticCategories = [
    {
      name: "Corporate & Luxury Events",
      description:
        "Elegant, world-class performances for galas, launches, and executive events across Ghana and West Africa.",
      image: corporateImg,
      cta: { label: "Book Corporate Event", href: "/bookings?category=corporate" },
    },
    {
      name: "Weddings & Private Celebrations",
      description:
        "Soulful bands and curated playlists to make your big day unforgettable.",
      image: weddingImg,
      cta: { label: "Plan Your Wedding", href: "/bookings?category=weddings" },
    },
    {
      name: "Concerts & Festivals",
      description:
        "Large-scale performances and professional setups for artists and audiences.",
      image: festivalImg,
      cta: { label: "View Concert Packages", href: "/bookings?category=concerts" },
    },
  ];

  return (
    <div className="liveband-page-container theme-live-band">
      {/* HERO SECTION */}
      <section className="liveband-hero-section">
        <div className="hero-visual-wrap">
          {banners.length > 0 ? (
            <BannerCards endpoint="LiveBandServicePage" type="banner" loading={loading} />
          ) : (
            <div className="hero-fallback" style={{ backgroundImage: `url(${heroFallback})` }} />
          )}

          {videoUrl && (
            <video
              ref={videoRef}
              className="hero-video"
              src={videoUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="auto"
            />
          )}
        </div>

        <div className="hero-overlay" />

        <motion.div
          className="hero-content glass-panel"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeUp}
        >
          <h1 className="hero-title">Live Band & Performances</h1>
          <p className="hero-subtitle">
            Experience Ghana's most electrifying live music — from weddings to festivals, we bring rhythm, soul, and artistry to every event.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => navigate("/bookings")}>
              Book a Live Band
            </button>
            <button className="btn btn-outline" onClick={scrollToGallery}>
              Watch Performances
            </button>
          </div>
        </motion.div>

        <button className="mute-button" onClick={toggleMute}>
          {isMuted ? "🔇" : "🔊"}
        </button>
      </section>

      {/* DYNAMIC SERVICES */}
      <motion.section 
        className="section liveband-services" 
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: true, amount: 0.25 }} 
        variants={fadeUp}
      >
        <h2 className="section-title">Our Live Band Services</h2>
        {services.length > 0 ? (
          <ServiceCategory
            category={{
              name: "Live Band",
              services: services.map((srv) => ({
                name: srv.name,
                description: srv.description,
                icon: srv.icon,
              })),
            }}
          />
        ) : <p>No live band services available at the moment.</p>}
      </motion.section>

      {/* STATIC SERVICE SECTIONS */}
      <motion.section 
        className="section static-categories-section" 
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: true, amount: 0.25 }} 
        variants={fadeUp}
      >
        <h2 className="section-title">Performance Categories</h2>
        <p className="section-description">Tailored experiences for every occasion</p>
        <div className="category-grid">
          {staticCategories.map((c, i) => (
            <motion.article key={i} className="category-card" variants={zoomIn}>
              <img src={c.image} alt={c.name} className="category-image" />
              <div className="card-body">
                <h3>{c.name}</h3>
                <p>{c.description}</p>
                <button className="btn btn-outline" onClick={() => navigate(c.cta.href)}>
                  {c.cta.label}
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.section>

      {/* VIDEOS */}
      <motion.section 
        className="section video-section" 
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: true, amount: 0.25 }} 
        variants={fadeUp}
      >
        <h2 className="section-title">Performance Videos</h2>
        <p className="section-description">Featured live performances captured on stage.</p>
        <VideoGallery endpoint="LiveBandServicePage" />
      </motion.section>

      {/* MEDIA GALLERY */}
      <motion.section 
        className="section gallery-section" 
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: true, amount: 0.25 }} 
        variants={fadeUp}
      >
        <h2 className="section-title">Performance Highlights</h2>
        <p className="section-description">Memorable moments from Eethm Live Band's most iconic events.</p>
        <div className="gallery-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />)
            : mediaCards.length > 0
            ? mediaCards.slice(0, 9).map((m, i) => <MediaCard key={m.id ?? i} media={m} />)
            : <div className="empty-placeholder"><p>No gallery items yet. Check back soon.</p></div>
          }
        </div>
      </motion.section>

      {/* OTHER SERVICES */}
      <motion.section 
        className="section other-services-section" 
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: true, amount: 0.25 }} 
        variants={fadeUp}
      >
        <h2 className="section-title">Explore Our Other Services</h2>
        {otherServices.length > 0 ? (
          <ServiceCategory
            category={{
              name: "Other Services",
              services: otherServices.map((srv) => ({
                name: srv.name,
                description: srv.description,
                icon: srv.icon || "🎵",
              })),
            }}
          />
        ) : <p>No additional services available.</p>}
      </motion.section>

      {/* REVIEWS */}
      <section className="section reviews-section">
        <ReviewsLayout 
          title="Client Impressions" 
          description="What our guests and partners say about Eethm Live Band"
        >
          <Reviews limit={6} hideForm category="LiveBandServicePage" />
        </ReviewsLayout>
      </section>
    </div>
  );
}
