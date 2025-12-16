import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import ServiceCategory from "./ServiceCategory";
import MediaCards from "../context/MediaCards";
import MediaSkeleton from "../context/MediaSkeleton";
import Reviews from "../user/Reviews";
import ReviewsLayout from "../user/ReviewsLayout";
import useFetcher from "../../hooks/useFetcher";

import "./decor.css";

import floralDecor from "../../assets/decor/floral-decor.png";
import lightingDecor from "../../assets/decor/lighting-decor.png";
import stageDecor from "../../assets/decor/stage-decor.png";
import decorHero from "../../assets/decor/decor-hero.png";

/* === Utilities === */
const toArray = (payload) =>
  Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];

const getMediaUrl = (m) =>
  m?.secure_url || m?.url || m?.video_url || m?.file || "";

export default function DecorServicePage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const { data: videosRaw } = useFetcher("videos", "decor");
  const { data: mediaRaw, loading: mediaLoading } = useFetcher("media", "decor");

  const [videoUrl, setVideoUrl] = useState(null);
  const [isMuted, setIsMuted] = useState(true);

  /* === Select featured video === */
  useEffect(() => {
    const videos = toArray(videosRaw);
    if (!videos.length) return;
    setVideoUrl(getMediaUrl(videos.find(v => v.is_featured) || videos[0]));
  }, [videosRaw]);

  const toggleMute = useCallback(() => {
    setIsMuted(v => {
      if (videoRef.current) videoRef.current.muted = !v;
      return !v;
    });
  }, []);

  const decorCategories = [
    {
      name: "Floral & Table Decor",
      image: floralDecor,
      services: [
        { name: "Luxury Floral Arrangements", description: "Elegant floral styling tailored to your theme." },
        { name: "Table Styling", description: "Premium linens, cutlery, and accents." },
        { name: "Backdrop Flowers", description: "Floral walls & ceremonial backdrops." }
      ]
    },
    {
      name: "Lighting & Ambience",
      image: lightingDecor,
      services: [
        { name: "Mood Lighting", description: "Warm and ambient lighting designs." },
        { name: "Lanterns & Chandeliers", description: "Elegant overhead decor." },
        { name: "LED Installations", description: "Dynamic lighting for stages & venues." }
      ]
    },
    {
      name: "Stage & Venue Design",
      image: stageDecor,
      services: [
        { name: "Stage Backdrops", description: "Custom themed backdrops." },
        { name: "Draping & Ceiling Work", description: "Luxury fabric styling." },
        { name: "Entrance Decor", description: "Striking first impressions." }
      ]
    }
  ];

  return (
    <main className="decor-page theme-decor">

      {/* ================= HERO ================= */}
      <section className="decor-hero">
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              className="decor-hero-video"
              autoPlay
              loop
              muted={isMuted}
              playsInline
            />
            <div className="decor-hero-overlay" />
          </>
        ) : (
          <div
            className="decor-hero-fallback"
            style={{ backgroundImage: `url(${decorHero})` }}
          />
        )}

        <div className="decor-hero-content">
          <h1 className="decor-hero-title">Decor & Event Styling</h1>
          <p className="decor-hero-subtitle">
            Elegant floral artistry, immersive lighting, and bespoke venue design
            across Ghana and West Africa.
          </p>

          <div className="decor-hero-actions">
            <button className="btn btn-primary" onClick={() => navigate("/bookings")}>
              Book Decor Service
            </button>
            <button
              className="btn btn-outline"
              onClick={() =>
                document.querySelector(".decor-services")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              View Gallery
            </button>
          </div>
        </div>

        <button className="decor-mute-button" onClick={toggleMute}>
          {isMuted ? "🔇" : "🔊"}
        </button>
      </section>

      {/* ================= SERVICES ================= */}
      <section className="decor-services">
        <h2 className="decor-section-title">Our Decor Services</h2>
        <p className="decor-section-description">
          Thoughtfully designed atmospheres that elevate weddings, corporate, and cultural events.
        </p>

        <div className="decor-category-grid">
          {decorCategories.map((cat, i) => (
            <div key={i} className="decor-category-card">
              <img src={cat.image} alt={cat.name} className="decor-category-image" />
              <ServiceCategory category={cat} />
            </div>
          ))}
        </div>
      </section>

      {/* ================= GALLERY ================= */}
      <section className="decor-gallery">
        <h2 className="decor-section-title">Decor Highlights</h2>
        <div className="decor-gallery-grid">
          {mediaLoading
            ? Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />)
            : toArray(mediaRaw).map((m, i) => (
                <MediaCards key={m.id ?? i} media={m} />
              ))}
        </div>
      </section>

      {/* ================= REVIEWS ================= */}
      <ReviewsLayout
        title="Client Impressions"
        description="What clients say about our decor services"
      >
        <Reviews limit={6} hideForm category="decor" />
      </ReviewsLayout>

    </main>
  );
}
