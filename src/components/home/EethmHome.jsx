import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../api/axiosInstance'; // ✅ Uses env-based backend URL
import { useNavigate } from 'react-router-dom';
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
  const [video, setVideo] = useState(null);
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
    const fetchVideo = async () => {
      try {
        const response = await axiosInstance.get('videos/');
        const activeVideo = response.data.find((v) => v.is_active);
        if (activeVideo) {
          setVideo(activeVideo);
        } else {
          setError('No active video found.');
        }
      } catch (err) {
        console.error('Video fetch error:', err);
        setError('Failed to load video.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, []);

  return (
    <div className="eethm-home-page">
      {/* === Video Hero Section === */}
      <section className="video-hero-section">
        {loading ? (
          <p className="video-fallback">Loading video...</p>
        ) : error ? (
          <p className="video-fallback" style={{ color: 'red' }}>{error}</p>
        ) : (
          <>
            <video
              ref={videoRef}
              className="background-video"
              autoPlay
              loop
              muted={isMuted}
              playsInline
            >
              <source src={video.video_file} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
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
            <button className="mute-button" onClick={toggleMute}>
              {isMuted ? '🔇' : '🔊'}
            </button>
          </>
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
    </div>
  );
};

export default EethmHome;
