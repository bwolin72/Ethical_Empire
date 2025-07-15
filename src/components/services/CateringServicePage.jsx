import React, { useEffect, useState, useCallback } from 'react';
import './catering.custom.css';
import { Card, CardContent } from '../../components/ui/card';
import { motion } from 'framer-motion';
import publicAxios from '../../api/publicAxios';
import MediaCard from '../context/MediaCard';
import BannerCards from '../context/BannerCards';
import { useNavigate } from 'react-router-dom';

const CateringPage = () => {
  const navigate = useNavigate();
  const [mediaCards, setMediaCards] = useState([]);
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
    'Vegan Waakye', 'Keto Banku', 'Gluten-Free Fufu', 'Low Carb Jollof',
    'Dairy-Free Stew', 'Nut-Free Soup', 'Halal Grill', 'Kosher Platter',
    'Vegetarian Jollof', 'Paleo Plantain Mix', 'Organic Yam Chips', 'Diabetic-Friendly Tilapia',
  ];

  const fetchData = useCallback(async () => {
    try {
      const [mediaRes, reviewsRes] = await Promise.all([
        publicAxios.get('/media/featured/?endpoint=CateringPage'),
        publicAxios.get('/reviews/')
      ]);

      const media = Array.isArray(mediaRes.data?.results)
        ? mediaRes.data.results.filter(
            (item) => item && item.is_active && item.type === 'media'
          )
        : [];

      const reviews = Array.isArray(reviewsRes.data)
        ? reviewsRes.data
        : [];

      setMediaCards(media);
      setTestimonials(reviews);
    } catch (error) {
      console.error('Error loading catering content:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="catering-page-container">
      {/* === Hero Banner Section === */}
      <section className="catering-banners">
        <BannerCards endpoint="CateringPage" title="Catering Highlights" />
      </section>

      {/* === CTA Section === */}
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
          {cateringServices.map((service, index) => (
            <Card key={index} className="card">
              <CardContent className="card-content">{service}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* === Creative Catering Media === */}
      <section className="section creative-section">
        <div className="creative-layout">
          <div className="creative-media">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton-card shimmer" />
                ))
              : mediaCards.slice(0, 3).map((media) => (
                  <MediaCard key={media.id} media={media} />
                ))}
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
          {dietarySuggestions.map((item, index) => (
            <motion.div key={index} whileHover={{ scale: 1.05 }} className="dietary-card">
              {item}
            </motion.div>
          ))}
        </div>
      </section>

      {/* === Testimonials === */}
      <section className="section testimonial-section">
        <h2>What Clients Say</h2>
        <div className="testimonial-grid">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="testimonial-card skeleton shimmer">
                  <div className="testimonial-message">Loading review...</div>
                  <div className="testimonial-user">Loading...</div>
                </div>
              ))
            : testimonials.slice(0, 6).map((review, index) => (
                <Card key={review.id || index} className="testimonial-card">
                  <CardContent>
                    <p className="testimonial-text">"{review?.message || 'No message provided.'}"</p>
                    <p className="testimonial-user">— {review?.user?.username || 'Anonymous'}</p>
                  </CardContent>
                </Card>
              ))}
        </div>
      </section>

      {/* === WhatsApp Button === */}
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
