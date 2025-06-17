import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import axiosInstance from '../../api/publicAxios';
import MediaCard from '../context/MediaCard';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; // ✅ import navigate hook
import './liveband.css';

const fallbackImage = '/fallback-image.jpg';

const LiveBandServicePage = () => {
  const { isDarkMode } = useTheme();
  const [mediaCards, setMediaCards] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [heroBanner, setHeroBanner] = useState(null);
  const navigate = useNavigate(); // ✅ initialize navigation

  const liveBandServices = [
    'Wedding Performances',
    'Corporate Event Entertainment',
    'Birthday Live Music',
    'Jazz & Acoustic Sets',
    'Cultural & Traditional Shows',
    'Custom Music Experiences',
  ];

  useEffect(() => {
    axiosInstance
      .get('/api/media/?endpoint=LiveBandServicePage&type=hero')
      .then(res => {
        const hero = res.data.length > 0 ? res.data[0] : null;
        setHeroBanner(hero);
      })
      .catch(() => toast.error('Failed to load hero banner'));

    axiosInstance
      .get('/api/media/?endpoint=LiveBandServicePage')
      .then(res => {
        setMediaCards(res.data);
        toast.success('Media loaded successfully');
      })
      .catch(() => toast.error('Failed to load media'));

    axiosInstance
      .get('/api/reviews/')
      .then(res => setTestimonials(res.data))
      .catch(() => toast.error('Failed to load testimonials'));
  }, []);

  return (
    <div className={`liveband-page ${isDarkMode ? 'dark' : ''}`}>
      {/* Hero Banner */}
      <div
        className="banner"
        style={{
          backgroundImage: `url(${heroBanner?.url || fallbackImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <h1>Ethical Sounds</h1>
      </div>

      {/* CTA Button */}
      <section className="text-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="cta-button"
          onClick={() => navigate('/bookings')} // ✅ navigate on click
        >
          Book a Live Band
        </motion.button>
      </section>

      {/* Services Section */}
      <section>
        <h2 className="section-title">Live Band Services</h2>
        <div className="service-grid">
          {liveBandServices.map((service, idx) => (
            <div key={idx} className="service-card">
              {service}
            </div>
          ))}
        </div>
      </section>

      {/* Media Section */}
      <section className="media-section">
        <h3 className="text-2xl font-semibold mb-4">Performance Highlights</h3>
        <p className="text-lg mb-6">
          Our live bands create immersive musical moments tailored to your event.
          From soulful harmonies to high-energy sets, we bring the soundtrack
          that turns events into memories. Experience the magic of Ethical Sounds.
        </p>

        <div className="media-grid">
          {mediaCards.length > 0 ? (
            mediaCards.slice(0, 6).map((media, index) => (
              <MediaCard
                key={index}
                media={{ ...media, url: media.url || fallbackImage }}
              />
            ))
          ) : (
            <p>No media available at the moment.</p>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <h2>What Our Clients Say</h2>
        <div className="testimonial-grid">
          {testimonials.slice(0, 6).map((review, idx) => (
            <motion.div
              key={idx}
              className="testimonial-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <div className="floating-label">Review</div>
              <p>"{review.message}"</p>
              <div className="author">— {review.user?.username || 'Anonymous'}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/233000000000"
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.52 3.48a11.7 11.7 0 00-16.5 0A11.6 11.6 0 003 12.08a11.5 11.5 0 001.68 6.07L3 24l6-1.6a11.6 11.6 0 0012.1-2.42 11.6 11.6 0 000-16.5zm-5.9 12.6c-.25.7-1.4 1.3-2 1.3-.53 0-1.3-.1-3.8-1.8a8.4 8.4 0 01-2.7-3.4c-.3-.5-.3-.9 0-1.2.3-.3.8-.5 1.1-.5h.3c.2 0 .4.1.6.3l.9 1c.2.2.2.3.1.5-.2.5-.4.7-.6 1-.2.3-.4.5-.2.8.6 1 2.2 2.4 3.4 2.7.3.1.5 0 .7-.2l.5-.6c.1-.1.2-.2.4-.3.2-.1.4 0 .6.1l1.2.6c.2.1.4.3.4.5 0 .2-.2.5-.3.7z" />
        </svg>
      </a>
    </div>
  );
};

export default LiveBandServicePage;
