import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import MediaCard from '../context/MediaCard';
import './EethmHome.css';

const serviceDetails = {
  'live-band': {
    title: 'Live Band Performance',
    description:
      'Our talented musicians deliver unforgettable performances for weddings, corporate events, and private parties.',
    details: [
      'Customizable song lists',
      'Professional sound equipment',
      'Multiple band size options',
    ],
  },
  catering: {
    title: 'Catering Services',
    description: 'Gourmet catering for all event types with customizable menus.',
    details: [
      'Local and international cuisine',
      'Dietary restriction accommodations',
      'Full-service staff available',
    ],
  },
  decor: {
    title: 'Event Decor',
    description: 'Transform any venue into a magical space with our decor services.',
    details: ['Theme development', 'Custom installations', 'Full setup and teardown'],
  },
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
    const fetchContent = async () => {
      try {
        const [featuredRes, bannerRes, promoRes] = await Promise.all([
          axiosInstance.get('/media/featured/'),
          axiosInstance.get('/media/banners/?endpoint=EethmHome'),
          axiosInstance.get('/promotions/'),
        ]);

        const featured = featuredRes.data?.data;
        setHeroMedia(featured || null);
        setBanners(bannerRes.data || []);
        setPromotions(promoRes.data || []);
      } catch (err) {
        console.error('Homepage fetch error:', err);
        setError('Failed to load homepage content.');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return (
    <div className="eethm-home-page">
      {/* === Hero Section === */}
      <section className="video-hero-section">
        {loading ? (
          <p className="video-fallback">Loading hero...</p>
        ) : error ? (
          <p className="video-fallback" style={{ color: 'red' }}>{error}</p>
        ) : heroMedia ? (
          <>
            {(heroMedia.url || heroMedia.file_url)?.endsWith('.mp4') ? (
              <video
                ref={videoRef}
                className="background-video"
                autoPlay
                loop
                muted={isMuted}
                playsInline
              >
                <source src={heroMedia.url || heroMedia.file_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={heroMedia.url || heroMedia.file_url}
                alt="Hero"
                className="background-video"
              />
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
            {(heroMedia.url || heroMedia.file_url)?.endsWith('.mp4') && (
              <button className="mute-button" onClick={toggleMute}>
                {isMuted ? '🔇' : '🔊'}
              </button>
            )}
          </>
        ) : (
          <p className="video-fallback">No hero media found.</p>
        )}
      </section>

      {/* === Services Section === */}
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

      {/* === Promotions Section === */}
      <section className="promotions-section">
        <h2>Current Offers</h2>
        {promotions.length > 0 ? (
          <div className="promos-container">
            {promotions.map((promo) => (
              <div key={promo.id} className="promo-card">
                {promo.image_url && <img src={promo.image_url} alt={promo.title} />}
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

      {/* === Banner Highlights Section === */}
      <section className="banners-section">
        <h2>Highlights</h2>
        {banners.length > 0 ? (
          <div className="banners-container">
            {banners.map((media) => (
              <div key={media.id} className="banner-item">
                <MediaCard media={{ url: media.url || media.file_url, title: media.title }} />
              </div>
            ))}
          </div>
        ) : (
          <p>No highlights available at this time.</p>
        )}
      </section>
    </div>
  );
};

export default EethmHome;
