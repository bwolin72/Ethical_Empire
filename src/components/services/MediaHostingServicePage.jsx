import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import publixios from '../../api/publicAxios';
import BannerCards from '../context/BannerCards';
import './MediaHostingServicePage.css';

const SkeletonCard = () => <div className="skeleton-card shimmer" />;
const SkeletonTestimonial = () => (
  <div className="testimonial-card skeleton shimmer">
    <div className="testimonial-message">Loading review...</div>
    <div className="testimonial-user">Loading...</div>
  </div>
);

const MediaHostingServicePage = () => {
  const [mediaCards, setMediaCards] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [bannerUrl, setBannerUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const hostingServices = [
    'Videography Coverage',
    'Photography Sessions',
    'Drone Footage & Aerial Views',
    'Live Streaming & Event Recording',
    'Portrait & Studio Shoots',
    'On-site Event Hosting',
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mediaRes, bannerRes, testimonialsRes] = await Promise.all([
          publixios.get('/service_app/media/?type=media&endpoint=MediaHostingServicePage'),
          publixios.get('/service_app/media/?type=banner&endpoint=MediaHostingServicePage'),
          publixios.get('/reviews/'),
        ]);

        setMediaCards(mediaRes.data);
        if (bannerRes.data.length > 0) {
          setBannerUrl(bannerRes.data[0].url);
        }
        setTestimonials(testimonialsRes.data);
      } catch (error) {
        console.error('Fetching failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="liveband-page">
      {/* Banner Section */}
      <div className="hero-banner">
        {bannerUrl ? (
          <img src={bannerUrl} alt="Banner" className="hero-banner-image" />
        ) : (
          <div className="hero-banner-placeholder shimmer">Loading Banner...</div>
        )}
        <div className="hero-overlay" />
        <h1 className="hero-title">Capture & Host with Ethical Precision</h1>
      </div>

      {/* CTA Button */}
      <section className="cta-section">
        <button className="cta-button" onClick={() => navigate('/bookings')}>
          Request Hosting Services
        </button>
      </section>

      {/* Hosting Services */}
      <section className="section services-section">
        <h2>Our Multimedia & Hosting Services</h2>
        <div className="card-grid">
          {hostingServices.map((service, index) => (
            <div key={index} className="card">
              <div className="card-content">{service}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Media Showcase */}
      <section className="section creative-section">
        <div className="creative-layout">
          <div className="creative-media">
            {loading
              ? Array(3)
                  .fill(0)
                  .map((_, i) => <SkeletonCard key={i} />)
              : mediaCards.slice(0, 3).map((media, index) => (
                  <div key={index} className="media-card">
                    <img
                      src={media.url}
                      alt={media.title || 'Media'}
                      className="media-image"
                    />
                    <p className="media-title">{media.title}</p>
                  </div>
                ))}
          </div>
          <div className="creative-text">
            <h3>Visual Storytelling & Professional Coverage</h3>
            <p>
              Whether it’s a corporate launch, private shoot, or public concert,
              Ethical Multimedia ensures every moment is captured in stunning clarity.
              From cinematic videography to detailed photography and reliable hosting—
              your memories and messages are in expert hands.
            </p>
          </div>
        </div>
      </section>

      {/* Event Hosting Info */}
      <section className="section event-hosting-section">
        <h3>Hosting Event Place</h3>
        <p>
          Need a location for your next shoot, seminar, or celebration? We offer fully equipped
          event spaces with lighting, seating, sound, and ambiance—ready for recording,
          streaming, or staging your unforgettable moment. Let us be your venue partner.
        </p>
      </section>

      {/* Dynamic Banner Cards */}
      <section className="banner-cards-wrapper">
        <BannerCards endpoint="MediaHostingServicePage" />
      </section>

      {/* Testimonials */}
      <section className="section testimonial-section">
        <h2>Client Reviews</h2>
        <div className="testimonial-grid">
          {loading
            ? Array(3)
                .fill(0)
                .map((_, i) => <SkeletonTestimonial key={i} />)
            : testimonials.slice(0, 6).map((review, index) => (
                <div key={index} className="testimonial-card">
                  <p className="testimonial-text">"{review.message}"</p>
                  <p className="testimonial-user">— {review.user?.username || 'Anonymous'}</p>
                </div>
              ))}
        </div>
      </section>

      {/* WhatsApp Button */}
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

export default MediaHostingServicePage;
