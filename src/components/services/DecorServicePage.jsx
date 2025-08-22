import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./decor.css";
import MediaCard from "../context/MediaCards";
import MediaSkeleton from "../context/MediaSkeleton";
import BannerCards from "../context/BannerCards";
import useMediaFetcher from "../../hooks/useFetcher";
import apiService from "../../api/apiService";
import Services from "../home/Services"; // ✅ shared Services component

const DecorServicePage = () => {
  const navigate = useNavigate();

  const { media: mediaCards = [], loading: mediaLoading, fetchMedia } =
    useMediaFetcher();

  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);

  const [videoUrl, setVideoUrl] = useState("");
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  // === Fetch media ===
  useEffect(() => {
    fetchMedia({
      endpoint: "decor", // ✅ only valid endpoint keys
      type: "featured",
      is_active: true,
    });
  }, [fetchMedia]);

  // === Fetch testimonials ===
  const fetchTestimonials = useCallback(async () => {
    setLoadingTestimonials(true);
    try {
      const res = await apiService.getReviews({ category: "decor" });
      const reviews = Array.isArray(res?.data) ? res.data : [];
      setTestimonials(reviews);
    } catch (err) {
      console.error("Error loading reviews:", err);
      setTestimonials([]);
    } finally {
      setLoadingTestimonials(false);
    }
  }, []);

  // === Fetch video ===
  const fetchVideo = useCallback(async () => {
    try {
      const res = await apiService.getVideos({
        endpoint: "decor",
        is_active: true,
      });

      if (Array.isArray(res?.data) && res.data[0]?.video_url) {
        setVideoUrl(res.data[0].video_url);
      } else {
        setVideoUrl("/mock/hero-video.mp4");
      }
    } catch (err) {
      console.error("Error loading video:", err);
      setVideoUrl("/mock/hero-video.mp4");
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
    fetchVideo();
  }, [fetchTestimonials, fetchVideo]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  return (
    <div className="decor-page-container">
      {/* === Hero Banner or Video === */}
      <section className="banner-section">
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
            />
            <button className="mute-button" onClick={toggleMute}>
              {isMuted ? "🔇" : "🔊"}
            </button>
          </div>
        ) : (
          <BannerCards endpoint="decor" title="Decor Showcases" />
        )}
      </section>

      {/* === CTA Button === */}
      <section className="cta-section">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="cta-button"
          onClick={() => navigate("/bookings")}
        >
          Book Decor Service
        </motion.button>
      </section>

      {/* === Shared Decor Services === */}
      <section className="section">
        <h2 className="section-title">Our Decor Services</h2>
        <p className="section-description">
          From elegant floral arrangements to immersive lighting, explore the
          services that bring your event to life.
        </p>
        <Services />
      </section>

      {/* === Venue Transformation Preview === */}
      <section className="section creative-layout">
        <div className="creative-text">
          <h3>Transform Your Venue</h3>
          <p>
            Ethical Multimedia creates immersive, elegant decor tailored to your
            theme. From romantic weddings to vibrant cultural events, we handle
            every detail—so your space becomes unforgettable.
          </p>
        </div>
        <div className="creative-media">
          {mediaLoading ? (
            Array.from({ length: 2 }).map((_, i) => <MediaSkeleton key={i} />)
          ) : mediaCards?.length > 0 ? (
            mediaCards.slice(0, 2).map((media) => (
              <MediaCard key={media.id || media.url} media={media} />
            ))
          ) : (
            <p className="text-gray-500">No media available.</p>
          )}
        </div>
      </section>

      {/* === Decor Gallery === */}
      <section className="section">
        <h2 className="section-title">Decor Highlights</h2>
        <p className="section-description">
          Every event is a canvas—we decorate with purpose, elegance, and
          emotion. Discover the beauty of our decor setups in the gallery below.
        </p>
        <div className="card-grid">
          {mediaLoading ? (
            Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />)
          ) : mediaCards?.length > 0 ? (
            mediaCards.slice(0, 6).map((media) => (
              <MediaCard key={media.id || media.url} media={media} />
            ))
          ) : (
            <p className="text-center text-gray-500">
              No decor media available at the moment.
            </p>
          )}
        </div>
      </section>

      {/* === Testimonials === */}
      <section className="section">
        <h2 className="section-title">Client Impressions</h2>
        <div className="testimonial-grid">
          {loadingTestimonials ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="testimonial-card shimmer">
                <div className="testimonial-text">Loading review...</div>
                <div className="testimonial-user">Loading...</div>
              </div>
            ))
          ) : testimonials?.length > 0 ? (
            testimonials.slice(0, 6).map((review) => (
              <div
                key={review.id || review.message}
                className="testimonial-card"
              >
                <p className="testimonial-text">
                  {review.message
                    ? `"${review.message}"`
                    : '"No comment provided."'}
                </p>
                <p className="testimonial-user">
                  — {review.user?.username || "Anonymous"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No reviews yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default DecorServicePage;
