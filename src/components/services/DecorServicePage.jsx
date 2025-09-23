import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import BannerCards from "../context/BannerCards";
import MediaCard from "../context/MediaCards";
import MediaSkeleton from "../context/MediaSkeleton";
import Services from "../home/Services";
import Reviews from "../user/Reviews";
import ReviewsLayout from "../user/ReviewsLayout";

import useFetcher from "../../hooks/useFetcher";
import "./decor.css";

// --- Helpers ---
const toArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

const getMediaUrl = (m) => {
  const candidates = [
    m?.secure_url,
    m?.url?.full,
    m?.url,
    m?.video_url,
    m?.video_file,
    m?.file_url,
    m?.file,
    m?.src,
    m?.path,
  ];
  const found = candidates.find((c) => typeof c === "string" && c.trim() !== "");
  return found || "";
};

export default function DecorServicePage() {
  const navigate = useNavigate();

  // --- Hero media: prefer videos, else fall back to banners ---
  const { data: videosRaw, loading: videoLoading } = useFetcher(
    "videos",
    "decor",
    { is_active: true },
    { resource: "videos" }
  );
  const { data: bannerRaw, loading: bannerLoading } = useFetcher(
    "media",
    "banner",
    { category: "decor", is_active: true },
    { resource: "media" }
  );

  // --- Decor gallery media ---
  const { data: mediaCardsRaw, loading: mediaLoading } = useFetcher(
    "media",
    "decor",
    { is_active: true },
    { resource: "media" }
  );

  // --- Hero video playback control ---
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

  const bannerItems = toArray(bannerRaw);
  const mediaCards = toArray(mediaCardsRaw);

  return (
    <div className="decor-page-container">
      {/* === HERO SECTION === */}
      <section className="banner-section" aria-label="Hero">
        {videoUrl && !videoLoading ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              className="hero-video"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onError={() => setVideoUrl(null)}
            />
            <button
              className="mute-button"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute background video" : "Mute background video"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
          </>
        ) : bannerItems.length && !bannerLoading ? (
          <BannerCards items={bannerItems} title="Decor Showcases" />
        ) : (
          <div className="video-skeleton" />
        )}
      </section>

      {/* === CTA === */}
      <section className="cta-section">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="cta-button"
          onClick={() => navigate("/bookings")}
        >
          Book Decor Service
        </motion.button>
      </section>

      {/* === DECOR SERVICES === */}
      <section className="section">
        <h2>Our Decor Services</h2>
        <p>
          From elegant floral arrangements to immersive lighting,
          explore the services that bring your event to life.
        </p>
        <Services />
      </section>

      {/* === VENUE TRANSFORMATION === */}
      <section className="section creative-layout" aria-labelledby="transform-heading">
        <div className="creative-text">
          <h3 id="transform-heading">Transform Your Venue</h3>
          <p>
            Eethmgh Multimedia creates immersive, elegant decor tailored to your theme.
            From romantic weddings to vibrant cultural events, we handle every detail—
            so your space becomes unforgettable.
          </p>
        </div>
        <div className="creative-media">
          {mediaLoading ? (
            Array.from({ length: 2 }).map((_, i) => <MediaSkeleton key={i} />)
          ) : mediaCards.length ? (
            mediaCards.slice(0, 2).map((m, idx) => (
              <MediaCard key={m.id ?? m._id ?? idx} media={m} />
            ))
          ) : (
            <p className="muted-text">No media available.</p>
          )}
        </div>
      </section>

      {/* === DECOR GALLERY === */}
      <section className="section">
        <h2>Decor Highlights</h2>
        <p>
          Every event is a canvas—we decorate with purpose, elegance,
          and emotion. Discover the beauty of our decor setups in the gallery below.
        </p>
        <div className="card-grid">
          {mediaLoading ? (
            Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />)
          ) : mediaCards.length ? (
            mediaCards.slice(0, 6).map((m, idx) => (
              <MediaCard key={m.id ?? m._id ?? idx} media={m} />
            ))
          ) : (
            <p className="muted-text">No decor media available at the moment.</p>
          )}
        </div>
      </section>

      {/* === CLIENT REVIEWS (matches EethmHome pattern) === */}
      <ReviewsLayout
        title="Client Impressions"
        description="Here’s what people think about our Decor services"
      >
        {/* limit to first 6 reviews, no form on service page */}
        <Reviews limit={6} hideForm={true} category="decor" />
      </ReviewsLayout>
    </div>
  );
}
