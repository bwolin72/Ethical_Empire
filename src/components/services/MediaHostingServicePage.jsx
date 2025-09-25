// src/components/services/MediaHostingServicePage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import FadeInSection from "../FadeInSection";
import Services from "../home/Services";

import BannerCards from "../context/BannerCards";
import MediaCard from "../context/MediaCards";
import MediaSkeleton from "../context/MediaSkeleton";

import useFetcher from "../../hooks/useFetcher";
import Reviews from "../user/Reviews";
import ReviewsLayout from "../user/ReviewsLayout";

import "./MediaHostingServicePage.css";

// --- Helpers (same approach as EethmHome) ---
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

export default function MediaHostingServicePage() {
  const navigate = useNavigate();

  // --- Fetch hero videos, banners and media cards (pattern matches EethmHome) ---
  const { data: videosRaw, loading: videoLoading } = useFetcher(
    "videos",
    "mediaHostingServicePage",
    { is_active: true },
    { resource: "videos" }
  );

  const { data: bannerRaw, loading: bannerLoading } = useFetcher(
    "media",
    "banner",
    { category: "mediaHostingServicePage", is_active: true },
    { resource: "media" }
  );

  const { data: mediaCardsRaw, loading: mediaLoading } = useFetcher(
    "media",
    "mediaHostingServicePage",
    { is_active: true },
    { resource: "media" }
  );

  // --- Hero video playback ---
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
    <div className="media-hosting-page-container">
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
              <h1 className="hero-title">Media Hosting & Multimedia</h1>
              <p className="hero-subtitle">
                Capture, host and stream — professionally and reliably.
              </p>
              <div className="hero-buttons">
                <button className="btn-primary" onClick={() => navigate("/bookings")}>
                  Book Now
                </button>
                <button className="btn-secondary" onClick={() => navigate("/contact")}>
                  Contact Us
                </button>
              </div>
            </div>
            <button
              className="mute-button"
              onClick={toggleMute}
              aria-pressed={!isMuted}
              aria-label={isMuted ? "Unmute background video" : "Mute background video"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
          </>
        ) : videoLoading ? (
          <div className="video-placeholder" aria-hidden="true">
            <div className="video-skeleton" />
          </div>
        ) : (
          <BannerCards endpoint="mediaHostingServicePage" title="Capture & Host with Ethical Precision" />
        )}
      </section>

      {/* SERVICES */}
      <FadeInSection>
        <section className="content-section">
          <h2>Our Multimedia & Hosting Services</h2>
          <p className="muted-text">
            From event coverage to streaming and secure hosting, we provide end-to-end multimedia solutions.
          </p>
          <Services />
        </section>
      </FadeInSection>

      {/* CREATIVE PREVIEW / MEDIA CARDS */}
      <FadeInSection>
        <section className="media-cards-container">
          <h2 className="media-cards-title">Multimedia Preview</h2>
          <div className="media-cards-scroll-wrapper">
            {mediaLoading
              ? Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />)
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

      {/* MULTIMEDIA GALLERY */}
      <FadeInSection>
        <section className="gallery-section">
          <h2>Multimedia Gallery</h2>
          <div className="card-grid">
            {mediaLoading
              ? Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />)
              : mediaCards.length > 0 ? (
                  mediaCards.slice(0, 6).map((m, idx) => (
                    <MediaCard key={m.id ?? m._id ?? idx} media={m} />
                  ))
                ) : (
                  <p className="muted-text">No multimedia content available.</p>
                )}
          </div>
        </section>
      </FadeInSection>

      {/* CLIENT REVIEWS — matches EethmHome pattern */}
      <FadeInSection>
        <ReviewsLayout
          title="Client Impressions"
          description="Here’s what people think about our multimedia & hosting services"
        >
          {/* show approved reviews for this category, hide form on service pages */}
          <Reviews limit={6} hideForm={true} category="mediaHostingServicePage" />
        </ReviewsLayout>
      </FadeInSection>
    </div>
  );
}
