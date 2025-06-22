import React, { useEffect, useState } from 'react';
import './liveband.css';
import { Card, CardContent } from '../../components/ui/card';
import { motion } from 'framer-motion';
import publixios from '../../api/publicAxios';
import MediaCard from '../context/MediaCard';
import { useNavigate } from 'react-router-dom';

const LiveBandServicePage = () => {
  const navigate = useNavigate();
  const [mediaCards, setMediaCards] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [bannerUrl, setBannerUrl] = useState(null);

  const liveBandServices = [
    'Wedding Performances',
    'Corporate Event Entertainment',
    'Birthday Live Music',
    'Jazz & Acoustic Sets',
    'Cultural & Traditional Shows',
    'Custom Music Experiences',
  ];

  useEffect(() => {
    // Fetch media from integrated service_app
    publixios
      .get('/service_app/media/?category=LiveBandServicePage')
      .then(res => setMediaCards(res.data))
      .catch(() => setMediaCards([]));

    // Fetch banner from integrated service_app
    publixios
      .get('/service_app/banners/?page=LiveBandServicePage')
      .then(res => {
        if (res.data.length > 0) setBannerUrl(res.data[0].url);
      })
      .catch(() => setBannerUrl(null));

    // Fetch testimonials
    publixios
      .get('/reviews/')
      .then(res => setTestimonials(res.data))
      .catch(() => setTestimonials([]));
  }, []);

  return (
    <div className="liveband-page-container">
      {/* Banner Section */}
      <div className="hero-banner">
        {bannerUrl ? (
          <img src={bannerUrl} alt="Live Band Banner" className="hero-banner-image" />
        ) : (
          <div className="hero-banner-placeholder">No Banner Uploaded</div>
        )}
        <div className="hero-overlay" />
        <h1 className="hero-title">Ethical Sounds</h1>
      </div>

      {/* CTA */}
      <section className="cta-section">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="cta-button"
          onClick={() => navigate('/bookings')}
        >
          Book a Live Band
        </motion.button>
      </section>

      {/* Services */}
      <section className="section services-section">
        <h2>Live Band Services</h2>
        <div className="card-grid">
          {liveBandServices.map((service, index) => (
            <Card key={index} className="card">
              <CardContent className="card-content">{service}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Creative Section */}
      <section className="section creative-section">
        <div className="creative-layout">
          <div className="creative-media">
            {mediaCards.slice(0, 3).map((media, index) => (
              <MediaCard key={index} media={media} />
            ))}
          </div>
          <div className="creative-text">
            <h3>Immersive Musical Moments</h3>
            <p>
              Whether you're planning a wedding, corporate gala, or a private soirée,
              our bands deliver a customized soundtrack. Soulful ballads, high-energy hits,
              and traditional rhythms—we turn your event into a masterpiece.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section testimonial-section">
        <h2>Client Reviews</h2>
        <div className="testimonial-grid">
          {testimonials.slice(0, 6).map((review, index) => (
            <Card key={index} className="testimonial-card">
              <CardContent>
                <p className="testimonial-text">"{review.message}"</p>
                <p className="testimonial-user">— {review.user?.username || 'Anonymous'}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* WhatsApp Contact */}
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
