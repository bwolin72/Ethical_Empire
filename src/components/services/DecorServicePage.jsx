import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import publixios from '../../api/publicAxios';
import './decor.css';
import MediaCard from '../../components/context/MediaCard';

const DecorPage = () => {
  const navigate = useNavigate();
  const [mediaCards, setMediaCards] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  const decorServices = [
    'Wedding & Event Decor',
    'Stage Design',
    'Theme Styling',
    'Lighting & Ambience',
    'Table & Floral Arrangements',
    'Backdrop & Photo Booths',
  ];

  useEffect(() => {
    publixios
      .get('/service-app/media/?endpoint=DecorPage')
      .then(res => setMediaCards(res.data))
      .catch(() => setMediaCards([]));

    publixios
      .get('/reviews/')
      .then(res => setTestimonials(res.data))
      .catch(() => setTestimonials([]));
  }, []);

  return (
    <div className="decor-page">
      {/* Banner Section */}
      <div className="banner decor-banner">
        <h1 className="banner-title">Elegant Decor Solutions</h1>
      </div>

      {/* CTA Button */}
      <section className="text-center my-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="cta-button"
          onClick={() => navigate('/bookings')}
        >
          Book Decor Service
        </motion.button>
      </section>

      {/* Decor Services */}
      <section className="section">
        <h2 className="section-title">Our Decor Services</h2>
        <div className="service-grid">
          {decorServices.map((service, idx) => (
            <div key={idx} className="service-card">
              {service}
            </div>
          ))}
        </div>
      </section>

      {/* Transformation Text */}
      <section className="transform-section">
        <h3 className="text-2xl font-semibold text-center mb-4">Transform Your Venue</h3>
        <p className="text-lg text-center max-w-3xl mx-auto px-4">
          Ethical Multimedia creates immersive, elegant decor tailored to your theme.
          From romantic weddings to vibrant cultural events, we handle every detail—so your space becomes unforgettable.
        </p>
      </section>

      {/* Media Showcase */}
      <section className="media-section">
        <h3 className="text-2xl font-semibold mb-4">Decor Highlights</h3>
        <p className="text-lg mb-6">
          Every event is a canvas—we decorate with purpose, elegance, and emotion.
          Discover the beauty of our decor setups in the gallery below.
        </p>

        <div className="media-grid">
          {mediaCards.length > 0 ? (
            mediaCards.slice(0, 6).map((media, index) => (
              <MediaCard key={index} media={media} />
            ))
          ) : (
            <p className="text-center text-gray-500">No decor media available at the moment.</p>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2 className="section-title">Client Impressions</h2>
        <div className="testimonial-grid">
          {testimonials.slice(0, 6).map((review, idx) => (
            <div key={idx} className="testimonial-card">
              <p className="testimonial-text">"{review.message}"</p>
              <p className="author">— {review.user?.username || 'Anonymous'}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/233552988735"
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.52 3.48a11.7 11.7 0 00-16.5 0A11.6 11.6 0 003 12.08a11.5 11.5 0 001.68 6.07L3 24l6-1.6a11.6 11.6 0 0012.1-2.42 11.6 11.6 0 000-16.5zm-5.9 12.6c-.25.7-1.4 1.3-2 1.3-.53 0-1.3-.1-3.8-1.8a8.4 8.4 0 01-2.7-3.4c-.3-.5-.3-.9 0-1.2.3-.3.8-.5 1.1-.5h.3c.2 0 .4.1.6.3l.9 1c.2.2.2.3.1.5-.2.5-.4.7-.6 1-.2.3-.4.5-.2.8.6 1 2.2 2.4 3.4 2.7.3.1.5 0 .7-.2l.5-.6c.1-.1.2-.2.4-.3.2-.1.4 0 .6.1l1.2.6c.2.1.4.3.4.5 0 .2-.2.5-.3.7z" />
        </svg>
      </a>
    </div>
  );
};

export default DecorPage;
