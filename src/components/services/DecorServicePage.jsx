import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import publicAxios from '../../api/publicAxios';
import './decor.css';
import MediaCard from '../context/MediaCards';
import MediaSkeleton from '../context/MediaSkeleton';
import BannerCards from '../context/BannerCards';

const DecorPage = () => {
  const navigate = useNavigate();
  const [mediaCards, setMediaCards] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mediaError, setMediaError] = useState(false);

  const decorServices = [
    'Wedding & Event Decor',
    'Stage Design',
    'Theme Styling',
    'Lighting & Ambience',
    'Table & Floral Arrangements',
    'Backdrop & Photo Booths',
  ];

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setMediaError(false);
    try {
      const [mediaRes, reviewsRes] = await Promise.all([
        publicAxios.get('/media/featured/', {
          params: { endpoint: 'DecorPage' },
        }),
        publicAxios.get('/reviews/'),
      ]);

      const media = Array.isArray(mediaRes.data?.results)
        ? mediaRes.data.results.filter(item => item?.is_active && item?.type === 'media')
        : [];

      const reviews = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];

      setMediaCards(media);
      setTestimonials(reviews);
    } catch (error) {
      console.error('Error loading decor content:', error);
      setMediaError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return (
    <div className="decor-page-container">
      {/* === Hero Banner Section === */}
      <section className="banner-section">
        <BannerCards endpoint="DecorPage" title="Decor Showcases" />
      </section>

      {/* === CTA Section === */}
      <section className="cta-section">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="cta-button"
          onClick={() => navigate('/bookings')}
        >
          Book Decor Service
        </motion.button>
      </section>

      {/* === Decor Services === */}
      <section className="section">
        <h2 className="section-title">Our Decor Services</h2>
        <div className="card-grid">
          {decorServices.map((service, index) => (
            <div key={index} className="card">
              <div className="card-content">{service}</div>
            </div>
          ))}
        </div>
      </section>

      {/* === Transform Section === */}
      <section className="section creative-layout">
        <div className="creative-text">
          <h3>Transform Your Venue</h3>
          <p>
            Ethical Multimedia creates immersive, elegant decor tailored to your theme.
            From romantic weddings to vibrant cultural events, we handle every detail—
            so your space becomes unforgettable.
          </p>
        </div>
        <div className="creative-media">
          {loading
            ? Array.from({ length: 2 }).map((_, i) => <MediaSkeleton key={i} />)
            : mediaError || mediaCards.length === 0
            ? <p className="text-gray-500">No media available.</p>
            : mediaCards.slice(0, 2).map((media) => (
                <MediaCard key={media.id || media.url} media={media} />
              ))}
        </div>
      </section>

      {/* === Decor Gallery === */}
      <section className="section">
        <h2 className="section-title">Decor Highlights</h2>
        <p className="section-description">
          Every event is a canvas—we decorate with purpose, elegance, and emotion.
          Discover the beauty of our decor setups in the gallery below.
        </p>
        <div className="card-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />)
            : mediaError || mediaCards.length === 0
            ? <p className="text-center text-gray-500">No decor media available at the moment.</p>
            : mediaCards.slice(0, 6).map((media) => (
                <MediaCard key={media.id || media.url} media={media} />
              ))}
        </div>
      </section>

      {/* === Testimonials === */}
      <section className="section">
        <h2 className="section-title">Client Impressions</h2>
        <div className="testimonial-grid">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="testimonial-card shimmer">
                  <div className="testimonial-text">Loading review...</div>
                  <div className="testimonial-user">Loading...</div>
                </div>
              ))
            : testimonials.length > 0
            ? testimonials.slice(0, 6).map((review) => (
                <div key={review.id || review.message} className="testimonial-card">
                  <p className="testimonial-text">
                    {review.message ? `"${review.message}"` : '"No comment provided."'}
                  </p>
                  <p className="testimonial-user">— {review.user?.username || 'Anonymous'}</p>
                </div>
              ))
            : <p className="text-center text-gray-500">No reviews yet.</p>}
        </div>
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

export default DecorPage;
