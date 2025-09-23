import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import FadeInSection from "../FadeInSection";
import Services from "./Services";
import NewsletterSignup from "../user/NewsLetterSignup";

import BannerCards from "../context/BannerCards";
import MediaCard from "../context/MediaCards";
import MediaSkeleton from "../context/MediaSkeleton";

import useFetcher from "../../hooks/useFetcher";
import Reviews from "../user/Reviews";
import ReviewsLayout from "../user/ReviewsLayout";

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

  // --- Hero video ---
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

  return (
    <div className="eethm-home-page">
      {/* HERO SECTION */}
      <section className="video-hero-section" aria-label="Hero">
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
              onError={() => setVideoUrl(null)}
            />
            <div className="overlay-gradient" />
            <div className="overlay-content">
              <h1 className="hero-title">Welcome to Eethm_GH</h1>
              <p className="hero-subtitle">
                Experience our ministrations and highlights
              </p>
              <div className="hero-buttons">
                <button
                  className="btn-primary"
                  onClick={() => navigate("/bookings")}
                >
                  Book Now
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setShowNewsletterForm(true)}
                >
                  📩 Subscribe
                </button>
              </div>
            </div>
            <button
              className="mute-button"
              onClick={toggleMute}
              aria-pressed={!isMuted}
              aria-label={
                isMuted ? "Unmute background video" : "Mute background video"
              }
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
          </>
        ) : videoLoading ? (
          <div className="video-placeholder" aria-hidden="true">
            <div className="video-skeleton" />
          </div>
        ) : (
          <BannerCards endpoint="home" title="Highlights" />
        )}
      </section>

      {/* SERVICES */}
      <FadeInSection>
        <section className="content-section">
          <h2>Explore Eethm_GH Ministrations</h2>
          <Services />
        </section>
      </FadeInSection>

      {/* MEDIA HIGHLIGHTS */}
      <FadeInSection>
        <section className="media-cards-container">
          <h2 className="media-cards-title">Our Media Library</h2>
          <div className="media-cards-scroll-wrapper">
            {mediaLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <MediaSkeleton key={i} />
                ))
              : mediaCards.length > 0 ? (
                  mediaCards.slice(0, 6).map((media, idx) => (
                    <MediaCard
                      key={media.id ?? media._id ?? media.url ?? idx}
                      media={media}
                    />
                  ))
                ) : (
                  <p className="muted-text">No media available at the moment.</p>
                )}
          </div>
        </section>
      </FadeInSection>

      {/* CLIENT REVIEWS */}
      <FadeInSection>
        <ReviewsLayout
          title="What Our Clients Say"
          description="Here’s what people think about our services"
        >
          <Reviews limit={6} hideForm={true} />
        </ReviewsLayout>
      </FadeInSection>

      {/* NEWSLETTER MODAL */}
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
            <NewsletterSignup />
          </div>
        </div>
      )}
    </div>
  );
};

export default EethmHome;
