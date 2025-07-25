import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useMediaFetcher from '../../hooks/useMediaFetcher';
import axiosCommon from '../../api/axiosCommon';
import BannerCards from '../context/BannerCards';
import MediaCard from '../context/MediaCard';
import FadeInSection from '../FadeInSection';
import './EethmHome.css';

const serviceDetails = {
  'live-band': {
    title: 'Live Band Performance',
    description: 'Our talented musicians deliver unforgettable performances for weddings, corporate events, and private parties.',
    details: ['Customizable song lists', 'Professional sound equipment', 'Multiple band size options'],
  },
  catering: {
    title: 'Catering Services',
    description: 'Gourmet catering for all event types with customizable menus.',
    details: ['Local and international cuisine', 'Dietary restriction accommodations', 'Full-service staff available'],
  },
  decor: {
    title: 'Event Decor',
    description: 'Transform any venue into a magical space with our decor services.',
    details: ['Theme development', 'Custom installations', 'Full setup and teardown'],
  },
};

const getMediaUrl = (media) => {
  if (!media) return '';
  return media.url?.full || media.file_url || '';
};

const EethmHome = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [isMuted, setIsMuted] = useState(true);
  const [promotions, setPromotions] = useState([]);
  const [promoError, setPromoError] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [reviewError, setReviewError] = useState(null);

  const {
    media: heroMediaArr,
    loading: heroLoading,
    error: heroError
  } = useMediaFetcher({ type: 'media', endpoint: 'EethmHome', isActive: true });

  const heroMedia = heroMediaArr?.[0] || null;
  const heroURL = getMediaUrl(heroMedia);
  const isVideo = heroURL.endsWith('.mp4');

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    // Fetch active promotions
    axiosCommon.get('/promotions/active/', { signal: controller.signal })
      .then(res => {
        setPromotions(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        if (err.name !== 'CanceledError') {
          console.error('Promotions fetch error:', err);
          setPromoError('Failed to load promotions.');
        }
      });

    // Fetch approved reviews
    axiosCommon.get('/reviews/', { signal: controller.signal })
      .then(res => {
        setReviews(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        if (err.name !== 'CanceledError') {
          console.error('Reviews fetch error:', err);
          setReviewError('Failed to load reviews.');
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="eethm-home-page">
      {/* === Hero Section === */}
      <section className="video-hero-section">
        {heroLoading ? (
          <p className="video-fallback">Loading hero...</p>
        ) : heroError ? (
          <p className="video-fallback" style={{ color: 'red' }}>{heroError}</p>
        ) : heroURL ? (
          <>
            {isVideo ? (
              <video
                ref={videoRef}
                className="background-video"
                autoPlay
                loop
                muted={isMuted}
                playsInline
              >
                <source src={heroURL} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img src={heroURL} alt="Hero" className="background-video" loading="lazy" />
            )}
            <div className="overlay-content">
              <h1>Ethical Multimedia GH Services</h1>
              <p>Live Band • Catering • Multimedia • Decor Services</p>
              <div className="hero-buttons">
                <button onClick={() => navigate('/bookings')}>Book Now</button>
                <button onClick={() => navigate('/newsletter')} className="newsletter-btn">
                  📩 Subscribe to Newsletter
                </button>
              </div>
            </div>
            {isVideo && (
              <button className="mute-button" onClick={toggleMute}>
                {isMuted ? '🔇' : '🔊'}
              </button>
            )}
          </>
        ) : (
          <p className="video-fallback">No hero media available.</p>
        )}
      </section>

      {/* === Services Section === */}
      <FadeInSection>
        <section className="services-page">
          <h2>Our Services</h2>
          <div className="service-list">
            {Object.entries(serviceDetails).map(([key, service]) => (
              <div key={key} className="service-item">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <ul>
                  {service.details.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
                <a href={`/services/${key}`}>Learn more</a>
              </div>
            ))}
          </div>
        </section>
      </FadeInSection>

      {/* === Promotions Section === */}
      <FadeInSection>
        <section className="promotions-section">
          <h2>Current Offers</h2>
          {promotions.length > 0 ? (
            <div className="promos-container">
              {promotions.map(promo => (
                <div key={promo.id} className="promo-card">
                  {promo.image_url && (
                    <img
                      src={promo.image_url}
                      alt={promo.title}
                      loading="lazy"
                      onError={(e) => (e.target.style.display = 'none')}
                    />
                  )}
                  <div className="promo-content">
                    <h3>{promo.title}</h3>
                    <p>{promo.description}</p>
                    {promo.discount_percentage && (
                      <p className="discount">Save {promo.discount_percentage}%</p>
                    )}
                    <p className="validity">
                      Valid: {promo.valid_from} – {promo.valid_to}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : promoError ? (
            <p style={{ color: 'red' }}>{promoError}</p>
          ) : (
            <p>No current promotions.</p>
          )}
        </section>
      </FadeInSection>

      {/* === Client Testimonials Section === */}
      <FadeInSection>
        <section className="reviews-section">
          <h2>What Our Clients Say</h2>
          {reviews.length > 0 ? (
            <div className="reviews-container">
              {reviews.map(review => (
                <div key={review.id} className="review-card">
                  <p className="review-text">"{review.comment}"</p>
                  <p className="review-author">— {review.name || 'Anonymous'}</p>
                </div>
              ))}
            </div>
          ) : reviewError ? (
            <p style={{ color: 'red' }}>{reviewError}</p>
          ) : (
            <p>No client reviews available.</p>
          )}
        </section>
      </FadeInSection>

      {/* === Banner Highlights === */}
      <FadeInSection>
        <section className="banners-section">
          <h2>Highlights from Our Services</h2>
          <BannerCards endpoint="EethmHome" />
        </section>
      </FadeInSection>

      {/* === Media Cards Section === */}
      <FadeInSection>
        <section className="banners-section">
          <h2>Featured Media</h2>
          <MediaCard endpoint="EethmHome" type="media" />
        </section>
      </FadeInSection>
    </div>
  );
};

export default EethmHome;
