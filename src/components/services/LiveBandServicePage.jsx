import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import BannerCards from "../context/BannerCards";
import MediaCard from "../context/MediaCards";
import MediaSkeleton from "../context/MediaSkeleton";
import Services from "../home/Services";
import FadeInSection from "../FadeInSection";
import Reviews from "../user/Reviews";
import ReviewsLayout from "../user/ReviewsLayout";

import useFetcher from "../../hooks/useFetcher";

const toArray = (payload) =>
  Array.isArray(payload?.data) ? payload.data :
  Array.isArray(payload) ? payload : [];

const getMediaUrl = (m) =>
  m?.url?.full || m?.video_url || m?.file_url || "";

const LiveBandServicePage = () => {
  const navigate = useNavigate();

  // --- Media & Videos ---
  const { data: mediaRaw, loading: mediaLoading } = useFetcher(
    "media",
    "liveband",
    { is_active: true },
    { resource: "media" }
  );
  const { data: videosRaw, loading: videoLoading } = useFetcher(
    "videos",
    "liveband",
    { is_active: true },
    { resource: "videos" }
  );

  const mediaCards = toArray(mediaRaw);

  // --- Hero Video ---
  const [videoUrl, setVideoUrl] = useState(null);
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const videos = toArray(videosRaw);
    if (!videos.length) {
      if (!videoLoading) setVideoUrl(null);
      return;
    }
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

  return (
    <div className="liveband-page-container">
      {/* === Hero Section === */}
      <section className="banner-section">
        {videoUrl && !videoLoading ? (
          <div className="video-wrapper">
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
              aria-pressed={!isMuted}
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
          </div>
        ) : videoLoading ? (
          <div className="video-placeholder">
            <div className="video-skeleton" />
          </div>
        ) : (
          <BannerCards endpoint="liveband" title="Live Band Showcases" />
        )}
      </section>

      {/* === CTA Section === */}
      <section className="cta-section">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="cta-button"
          onClick={() => navigate("/bookings")}
        >
          Book Live Band
        </motion.button>
      </section>

      {/* === Services Section === */}
      <section className="section">
        <h2 className="section-title">Our Live Band Services</h2>
        <Services />
      </section>

      {/* === Media Gallery === */}
      <section className="section">
        <h2 className="section-title">Band Highlights</h2>
        <div className="card-grid">
          {mediaLoading
            ? Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />)
            : mediaCards.length > 0
            ? mediaCards.slice(0, 6).map((m, i) => (
                <MediaCard key={m.id ?? m._id ?? i} media={m} />
              ))
            : <p className="muted-text center-text">No live band media available.</p>}
        </div>
      </section>

      {/* === Client Reviews (EethmHome style) === */}
      <FadeInSection>
        <ReviewsLayout
          title="Client Impressions"
          description="Here’s what people think about our live band performances"
        >
          {/* ✅ unified reviews fetch; no direct apiService call needed */}
          <Reviews limit={6} hideForm={true} category="liveband" />
        </ReviewsLayout>
      </FadeInSection>
    </div>
  );
};

export default LiveBandServicePage;
