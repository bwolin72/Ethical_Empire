import React, { useEffect, useState, useRef } from 'react';
import './liveband.css';
import { Card, CardContent } from '../ui/Card';
import { motion } from 'framer-motion';
import publicAxios from '../../api/publicAxios';
import axiosCommon from '../../api/axiosCommon';
import { useNavigate } from 'react-router-dom';
import BannerCards from '../context/BannerCards';
import MediaCards from '../context/MediaCards';

const LiveBandServicePage = () => {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState('');
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  const liveBandServices = [
    '🎤 Wedding Performances',
    '🏢 Corporate Event Entertainment',
    '🎂 Birthday Live Music',
    '🎷 Jazz & Acoustic Sets',
    '🪘 Cultural & Traditional Shows',
    '🎼 Custom Music Experiences',
  ];

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [reviewRes, videoRes] = await Promise.all([
          publicAxios.get('/reviews/'),
          axiosCommon.get('/api/videos/?endpoint=LiveBandServicePage&is_active=true'),
        ]);
        setTestimonials(Array.isArray(reviewRes.data) ? reviewRes.data : []);

        if (Array.isArray(videoRes.data) && videoRes.data.length > 0) {
          setVideoUrl(videoRes.data[0].video_url);
        }
      } catch (error) {
        console.error('Failed to load content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  return (
    <div className="liveband-page">
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
              {isMuted ? '🔇' : '🔊'}
            </button>
            <div className="hero-overlay">
              <h1 className="hero-title">Experience the Rhythm of Elegance</h1>
              <p className="hero-subtitle">Professional Live Bands for Unforgettable Events</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="cta-button hero-button"
                onClick={() => navigate('/bookings')}
              >
                Book a Live Band
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="hero-overlay">
            <h1 className="hero-title">Experience the Rhythm of Elegance</h1>
            <p className="hero-subtitle">Professional Live Bands for Unforgettable Events</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="cta-button hero-button"
              onClick={() => navigate('/bookings')}
            >
              Book a Live Band
            </motion.button>
            <div className="banner-cards-wrapper">
              <BannerCards endpoint="LiveBandServicePage" title="Live Band Highlights" />
            </div>
          </div>
        )}
      </section>

      {/* === Services Offered === */}
      <section className="section services-section">
        <h2 className="section-title">Live Band Services</h2>
        <p className="section-description">
          From intimate acoustic duos to full orchestras — choose your sound.
        </p>
        <div className="card-grid">
          {liveBandServices.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="service-card">
                <CardContent className="card-content">{service}</CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* === Immersive Preview === */}
      <section className="section creative-section">
        <div className="creative-layout">
          <div className="creative-text">
            <h3 className="section-subtitle">Immersive Musical Moments</h3>
            <p className="section-description">
              Whether you're planning a wedding, corporate gala, or private soirée,
              our live bands deliver timeless melodies and unmatched ambiance that
              elevate your event to extraordinary.
            </p>
          </div>
          <div className="creative-media">
            <MediaCards endpoint="LiveBandServicePage" fullWidth={false} title="" />
          </div>
        </div>
      </section>

      {/* === Testimonials === */}
      <section className="section testimonial-section">
        <h2 className="section-title">Client Reviews</h2>
        <p className="section-description">
          Hear what our clients say about their elevated musical experiences.
        </p>
        <div className="testimonial-grid">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="testimonial-card shimmer">
                  <div className="testimonial-text">Loading...</div>
                  <div className="testimonial-user">Loading...</div>
                </div>
              ))
            : testimonials.length > 0 ? (
                testimonials.slice(0, 6).map((review, index) => (
                  <motion.div
                    key={review.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="testimonial-card">
                      <CardContent className="card-content">
                        <p className="testimonial-text">"{review.message}"</p>
                        <p className="testimonial-user">— {review.user?.username || 'Anonymous'}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <p className="section-description text-center text-gray-500">
                  No client reviews available yet.
                </p>
              )}
        </div>
      </section>

      {/* === Full Media Gallery === */}
      <section className="section media-gallery-section">
        <h2 className="section-title">Full Gallery</h2>
        <MediaCards endpoint="LiveBandServicePage" fullWidth={true} title="" />
      </section>

      {/* === WhatsApp CTA === */}
      <a
        href="https://wa.me/233552988735"
        className="whatsapp-button"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.52 3.48a11.7 11.7 0 00-16.5 0A11.6 11.6 0 003 12.08a11.5 11.5 0 001.68 6.07L3 24l6-1.6a11.6 11.6 0 0012.1-2.42 11.6 11.6 0 000-16.5zm-5.9 12.6c-.25.7-1.4 1.3-2 1.3-.53 0-1.3-.1-3.8-1.8a8.4 8.4 0 01-2.7-3.4c-.3-.5-.3-.9 0-1.2.3-.3.8-.5 1.1-.5h.3c.2 0 .4.1.6.3l.9 1c.2.2.2.3.1.5-.2.5-.4.7-.6 1-.2.3-.4.5-.2.8.6 1 2.2 2.4 3.4 2.7.3.1.5 0 .7-.2l.5-.6c.1-.1.2-.2.4-.3.2-.1.4 0 .6.1l1.2.6c.2.1.4.3.4.5 0 .2-.2.5-.3.7z" />
        </svg>
      </a>
    </div>
  );
};

export default LiveBandServicePage;
