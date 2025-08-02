import React, { useEffect, useState, useCallback } from 'react';
import './catering.custom.css';
import { Card, CardContent } from '../ui/Card';
import { motion } from 'framer-motion';
import publicAxios from '../../api/publicAxios';
import MediaCards from '../context/MediaCards';
import BannerCards from '../context/BannerCards';
import { useNavigate } from 'react-router-dom';
import {
  FaLeaf, FaPepperHot, FaCarrot, FaFish,
  FaDrumstickBite, FaAppleAlt, FaSeedling,
} from 'react-icons/fa';

const CateringPage = () => {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  const cateringServices = [
    'Traditional Ghanaian Buffet',
    'Continental Plated Meals',
    'Chop Bar Style (Local Experience)',
    'Western Canapés & Cocktails',
    'Live Grill Station (Kebab, Suya, Chicken)',
    'Luxury Wedding Banquet Service',
  ];

  const dietarySuggestions = [
    { label: 'Vegan Waakye', icon: <FaLeaf /> },
    { label: 'Keto Banku', icon: <FaPepperHot /> },
    { label: 'Gluten-Free Fufu', icon: <FaCarrot /> },
    { label: 'Low Carb Jollof', icon: <FaSeedling /> },
    { label: 'Dairy-Free Stew', icon: <FaAppleAlt /> },
    { label: 'Nut-Free Soup', icon: <FaFish /> },
    { label: 'Halal Grill', icon: <FaDrumstickBite /> },
    { label: 'Kosher Platter', icon: <FaFish /> },
    { label: 'Vegetarian Jollof', icon: <FaLeaf /> },
    { label: 'Paleo Plantain Mix', icon: <FaCarrot /> },
    { label: 'Organic Yam Chips', icon: <FaAppleAlt /> },
    { label: 'Diabetic-Friendly Tilapia', icon: <FaFish /> },
  ];

  const eventTypes = [
    'Weddings',
    'Corporate Galas',
    'Private Dinners',
    'Product Launches',
    'Birthday Soirées',
    'Cocktail Receptions',
  ];

  const fetchData = useCallback(async () => {
    try {
      const { data } = await publicAxios.get('/reviews/');
      setTestimonials(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading testimonials:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="catering-page-container">
      {/* === Hero Section === */}
      <section className="catering-banners">
        <BannerCards endpoint="CateringPage" title="Catering Highlights" />
      </section>

      {/* === Call to Action === */}
      <section className="cta-section">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="cta-button"
          onClick={() => navigate('/bookings')}
        >
          Request a Custom Quote
        </motion.button>
      </section>

      {/* === Catering Services === */}
      <section className="section services-section">
        <h2>Our Catering Services</h2>
        <div className="card-grid">
          {cateringServices.map((service, i) => (
            <motion.div key={i} whileHover={{ scale: 1.03 }}>
              <Card className="card">
                <CardContent className="card-content">{service}</CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* === Event Types === */}
      <section className="section event-types-section">
        <h2>We Cater For</h2>
        <div className="card-grid">
          {eventTypes.map((event, i) => (
            <motion.div key={i} whileHover={{ scale: 1.03 }}>
              <Card className="card">
                <CardContent className="card-content">{event}</CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* === Creative Catering Media === */}
      <section className="section creative-section">
        <div className="creative-layout">
          <div className="creative-media">
            <MediaCards
              endpoint="CateringPage"
              type="media"
              title="Creative Catering Ideas"
              isFeatured
              isActive
            />
          </div>
          <div className="creative-text">
            <h3>Creative Catering Ideas</h3>
            <p>
              We blend Ghanaian heritage with Western flair to deliver diverse, mouthwatering
              culinary experiences. From live jollof bars and suya grills to cocktail canapé platters,
              our fusion offerings are tailored to elevate your event and wow every guest—local or international.
            </p>
          </div>
        </div>
      </section>

      {/* === Dietary Options === */}
      <section className="section dietary-section">
        <h2>Dietary Options</h2>
        <div className="dietary-grid">
          {dietarySuggestions.map(({ label, icon }, i) => (
            <motion.div key={i} className="dietary-card" whileHover={{ scale: 1.08 }}>
              <span className="dietary-icon">{icon}</span>
              {label}
            </motion.div>
          ))}
        </div>
      </section>

      {/* === Testimonials === */}
      <section className="section testimonial-section">
        <h2>What Clients Say</h2>
        <div className="testimonial-grid">
          {loading
            ? [...Array(3)].map((_, i) => (
                <div key={i} className="testimonial-card skeleton shimmer">
                  <div className="testimonial-message">Loading review...</div>
                  <div className="testimonial-user">Loading...</div>
                </div>
              ))
            : testimonials.slice(0, 6).map((review, i) => (
                <motion.div key={review?.id || i} whileHover={{ scale: 1.02 }}>
                  <Card className="testimonial-card">
                    <CardContent>
                      <p className="testimonial-text">"{review.message || 'No message provided.'}"</p>
                      <p className="testimonial-user">— {review.user?.username || 'Anonymous'}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
        </div>
      </section>

      {/* === WhatsApp CTA === */}
      <WhatsAppButton />
    </div>
  );
};

const WhatsAppButton = () => (
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
);

export default CateringPage;
