import React, { useState, useEffect, useRef } from 'react';
import publicAxios from '../../api/publicAxios';
import { useNavigate } from 'react-router-dom';
import MediaCard from '../context/MediaCard'; 
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

const EethmHome = () => {
  const [heroMedia, setHeroMedia] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
  };

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const { data } = await publicAxios.get('/media/');
        const hero = data.find(m => m.is_hero);
        const bannerList = data.filter(m => m.is_banner);

        setHeroMedia(hero);
        setBanners(bannerList);
      } catch (err) {
        console.error('Media fetch error:', err);
        setError('Failed to load homepage media.');
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
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
            {heroMedia.media_type === 'video' ? (
              <video
                ref={videoRef}
                className="background-video"
                autoPlay
                loop
                muted={isMuted}
                playsInline
              >
                <source src={heroMedia.file_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img src={heroMedia.file_url} alt="Hero" className="background-video" />
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
            {heroMedia.media_type === 'video' && (
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

      {/* === Banner Highlights Section === */}
      {banners.length > 0 && (
        <section className="banners-section">
          <h2>Highlights</h2>
          <div className="banners-container">
            {banners.map((media) => (
              <div key={media.id} className="banner-item">
                <MediaCard media={{ url: media.file_url, title: media.title }} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default EethmHome;
