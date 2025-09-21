import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import BannerCards from "../context/BannerCards";
import MediaCard from "../context/MediaCards";
import MediaSkeleton from "../context/MediaSkeleton";
import Services from "../home/Services";

import useFetcher from "../../hooks/useFetcher";
import apiService from "../../api/apiService";

const toArray = (payload) =>
  Array.isArray(payload?.data) ? payload.data :
  Array.isArray(payload) ? payload : [];

const getMediaUrl = (m) => m?.url?.full || m?.video_url || m?.file_url || "";

const LiveBandServicePage = () => {
  const navigate = useNavigate();

  const { data: mediaCardsRaw, loading: mediaLoading } = useFetcher(
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

  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);

  const fetchTestimonials = useCallback(async () => {
    setLoadingTestimonials(true);
    try {
      const res = await apiService.getReviews({ category: "liveband" });
      setTestimonials(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setTestimonials([]);
    } finally {
      setLoadingTestimonials(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const [videoUrl, setVideoUrl] = useState(null);
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const videos = toArray(videosRaw);
    if (videos.length === 0) {
      if (!videoLoading) setVideoUrl(null);
      return;
    }
    const src = getMediaUrl(videos.find((v) => v?.is_featured) ?? videos[0]);
    setVideoUrl(src || null);
  }, [videosRaw, videoLoading]);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  };

  const mediaCards = toArray(mediaCardsRaw);

  return (
    <div className="liveband-page-container">
      {/* Hero */}
      <section className="banner-section" aria-label="Hero">
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
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
          </div>
        ) : videoLoading ? (
          <div className="video-placeholder" />
        ) : (
          <BannerCards endpoint="liveband" title="Live Band Showcases" />
        )}
      </section>

      <section className="cta-section">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="cta-button"
          onClick={() => navigate("/bookings")}
        >
          Book Live Band
        </motion.button>
      </section>

      <section className="section">
        <h2 className="section-title">Our Live Band Services</h2>
        <Services />
      </section>

      <section className="section">
        <h2 className="section-title">Band Highlights</h2>
        <div className="card-grid">
          {mediaLoading
            ? Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />)
            : mediaCards.length > 0
            ? mediaCards.slice(0, 6).map((m, i) => (
                <MediaCard key={m.id ?? i} media={m} />
              ))
            : <p className="muted-text">No live band media available.</p>}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Client Impressions</h2>
        <div className="testimonial-grid">
          {loadingTestimonials
            ? <p>Loading reviews…</p>
            : testimonials.length > 0
            ? testimonials.slice(0, 6).map((r, i) => (
                <div key={r.id ?? i} className="testimonial-card">
                  <p>"{r.message || r.comment}"</p>
                  <p>— {r.user?.username || "Anonymous"}</p>
                </div>
              ))
            : <p className="muted-text">No reviews yet.</p>}
        </div>
      </section>
    </div>
  );
};

export default LiveBandServicePage;
