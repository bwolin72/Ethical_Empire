// EethmHome.jsx

import React, { useState, useEffect, useRef } from 'react';
import axiosCommon from '../../api/axiosCommon';
import { useNavigate } from 'react-router-dom';
import MediaCard from '../context/MediaCard';
import FadeInSection from '../FadeInSection';
import './EethmHome.css';

const serviceDetails = {
  'live-band': {
    title: 'Live Band Performance',
    description:
      'Our talented musicians deliver unforgettable performances for weddings, corporate events, and private parties.',
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
  return media.url || media.file_url || '';
};

const EethmHome = () => {
  const [heroMedia, setHeroMedia] = useState(null);
  const [banners, setBanners] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(true);

  const videoRef = useRef(null);
  const navigate = useNavigate();

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchContent = async () => {
      try {
        const [heroRes, bannerRes, promoRes] = await Promise.all([
          axiosCommon.get('/media/', {
            params: { type: 'media', endpoint: 'EethmHome', is_active: true },
            signal,
          }),
          axiosCommon.get('/media/', {
            params: { type: 'banner', endpoint: 'EethmHome', is_active: true },
            signal,
          }),
          axiosCommon.get('/promotions/', { signal }),
        ]);

        setHeroMedia(heroRes?.data?.[0] || null);
        setBanners(Array.isArray(bannerRes?.data) ? bannerRes.data : []);
        setPromotions(Array.isArray(promoRes?.data) ? promoRes.data : []);
      } catch (err) {
        if (err.name !== 'CanceledError') {
          console.error('Homepage fetch error:', err);
          setError('Failed to load homepage content.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
    return () => controller.abort();
  }, []);

  const heroURL = getMediaUrl(heroMedia);
  const isVideo = heroURL.endsWith('.mp4');

  return (
    <div className="eethm-home-page">
      {/* === Hero Section === */}
      <section className="video-hero-section">
        {loading ? (
          <p className="video-fallback">Loading hero...</p>
        ) : error ? (
          <p className="video-fallback" style={{ color: 'red' }}>{error}</p>
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
              {promotions.map((promo) => (
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
                      Valid: {promo.valid_from} - {promo.valid_to}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No current promotions.</p>
          )}
        </section>
      </FadeInSection>

      {/* === Banner Highlights Section === */}
      <FadeInSection>
        <section className="banners-section">
          <h2>Highlights</h2>
          {banners.length > 0 ? (
            <div className="banners-container">
              {banners.map((media) => (
                <div key={media.id} className="banner-item">
                  <MediaCard media={{ url: getMediaUrl(media), title: media.title }} />
                </div>
              ))}
            </div>
          ) : (
            <p>No highlights available at this time.</p>
          )}
        </section>
      </FadeInSection>
    </div>
  );
};

export default EethmHome;
