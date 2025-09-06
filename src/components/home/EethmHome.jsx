// src/components/home/EethmHome.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import FadeInSection from "../FadeInSection";
import Services from "./Services";
import NewsletterSignup from "../user/NewsLetterSignup";

// Feature components
import BannerCards from "../context/BannerCards";
import MediaCards from "../context/MediaCards";
import MediaGallery from "../gallery/MediaGallery";
import VideoGallery from "../videos/VideoGallery";

import "./EethmHome.css";

const LOCAL_FALLBACK_VIDEO = "/mock/hero-video.mp4";
const LOCAL_FALLBACK_IMAGE = "/mock/hero-fallback.jpg";

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

const EethmHome = () => {
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [media, setMedia] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [videosError, setVideosError] = useState(null);
  const [promoError, setPromoError] = useState(null);
  const [reviewError, setReviewError] = useState(null);

  const [showNewsletterForm, setShowNewsletterForm] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      const [videosData, promotionsData, reviewsData, mediaData] = await Promise.all([
        safeFetch(apiService.getVideos),
        safeFetch(apiService.getPromotions),
        safeFetch(apiService.getReviews),
        safeFetch(apiService.getMedia),
      ]);

      if (!mounted) return;

      setVideos(videosData);
      setPromotions(promotionsData);
      setReviews(reviewsData);
      setMedia(mediaData);

      if (!videosData.length) setVideosError("No videos available");
      if (!promotionsData.length) setPromoError("No promotions available");
      if (!reviewsData.length) setReviewError("No reviews available");
    };

    fetchAll();

    return () => { mounted = false; };
  }, []);

  const heroVideo = videos.length ? videos[0] : { url: LOCAL_FALLBACK_VIDEO };
  const galleryItems = [...videos, ...media].length
    ? [...videos, ...media]
    : [{ url: LOCAL_FALLBACK_IMAGE }];

  return (
    <div className="eethm-home-page">
      {/* HERO */}
      <section className="video-hero-section">
        <VideoGallery
          videos={[heroVideo]}
          fallbackVideo={LOCAL_FALLBACK_VIDEO}
          showHero
          autoPlay
          loop
          allowMuteToggle
          title="Ethical Multimedia GH"
          subtitle="Live Band • Catering • Multimedia • Decor Services"
          actions={[
            { label: "Book Now", onClick: () => navigate("/bookings"), className: "btn-primary" },
            { label: "📩 Subscribe", onClick: () => setShowNewsletterForm(true), className: "btn-secondary" },
          ]}
        />
      </section>

      {/* HERO HIGHLIGHTS */}
      <FadeInSection>
        <section className="banners-hero-wrap">
          <BannerCards endpointKey="banners" title="Highlights" type="banner" />
        </section>
      </FadeInSection>

      {/* SERVICES */}
      <FadeInSection>
        <section className="services-page">
          <h2>Explore Eethm_GH Ministrations</h2>
          <Services />
        </section>
      </FadeInSection>

      {/* PROMOTIONS */}
      <FadeInSection>
        <section className="promotions-section">
          <h2>Special Offers</h2>
          {promotions.length ? (
            <div className="promotions-grid">
              {promotions.map((p, idx) => (
                <article key={p.id ?? `promo-${idx}`} className="promotion-card">
                  {p.image_url && <img src={p.image_url} alt={p.title} />}
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                    {p.discount_percentage && <p>Save {p.discount_percentage}%</p>}
                  </div>
                </article>
              ))}
            </div>
          ) : promoError ? <p className="error-text">{promoError}</p> : <p className="muted-text">No promotions.</p>}
        </section>
      </FadeInSection>

      {/* MEDIA LIBRARY */}
      <FadeInSection>
        <section className="media-library-section">
          <h2>Our Media Library</h2>
          <MediaCards endpointKey="media" resourceType="media" title={null} fullWidth={false} isActive isFeatured={false} />
        </section>
      </FadeInSection>

      {/* GALLERY SHOWCASE */}
      <FadeInSection>
        <section className="media-gallery-section">
          <h2>Gallery Showcase</h2>
          {videosError && <p className="error-text">{videosError}</p>}
          <MediaGallery items={galleryItems} />
        </section>
      </FadeInSection>

      {/* REVIEWS */}
      <FadeInSection>
        <section className="reviews-section">
          <h2>What Our Clients Say</h2>
          {reviews.length ? (
            <div className="reviews-container">
              {reviews.map((r, idx) => (
                <div key={r.id ?? `review-${idx}`} className="review-card">
                  <p>"{r.comment}"</p>
                  <p>— {r.name || "Anonymous"}</p>
                </div>
              ))}
            </div>
          ) : reviewError ? <p className="error-text">{reviewError}</p> : <p className="muted-text">No reviews.</p>}
        </section>
      </FadeInSection>

      {/* NEWSLETTER */}
      {showNewsletterForm && (
        <div className="newsletter-modal-backdrop" onClick={() => setShowNewsletterForm(false)}>
          <div className="newsletter-modal" onClick={(e) => e.stopPropagation()} role="dialog">
            <button className="newsletter-close-btn" onClick={() => setShowNewsletterForm(false)} type="button">&times;</button>
            <NewsletterSignup />
          </div>
        </div>
      )}
    </div>
  );
};

export default EethmHome;
