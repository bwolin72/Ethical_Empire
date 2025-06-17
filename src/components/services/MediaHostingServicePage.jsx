import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/publicAxios';
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

  const navigate = useNavigate(); // ✅ Added

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
          axiosInstance.get('/api/media/?type=media&endpoint=MediaHostingServicePage'),
          axiosInstance.get('/api/media/?type=banner&endpoint=MediaHostingServicePage'),
          axiosInstance.get('/api/reviews/'),
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
    <div className="media-hosting-container">
      {/* Hero Section */}
      <div className="hero-banner">
        {bannerUrl ? (
          <img src={bannerUrl} alt="Banner" className="hero-banner-image" />
        ) : (
          <div className="hero-banner-placeholder shimmer">Loading Banner...</div>
        )}
        <div className="overlay">
          <h1 className="hero-title">Capture & Host with Ethical Precision</h1>
        </div>
      </div>

      {/* Call to Action */}
      <section className="cta-section">
        <button
          className="cta-button"
          onClick={() => navigate('/bookings')} // ✅ Navigate to bookings
        >
          Request Hosting Services
        </button>
      </section>

      {/* Hosting Services */}
      <section className="services-section">
        <h2 className="section-title">Our Multimedia & Hosting Services</h2>
        <div className="services-grid">
          {hostingServices.map((service, idx) => (
            <div key={idx} className="service-card">
              {service}
            </div>
          ))}
        </div>
      </section>

      {/* Media Section */}
      <section className="media-section">
        <div className="media-grid">
          <div className="media-gallery">
            {loading
              ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : mediaCards.slice(0, 3).map((media, index) => (
                  <div key={index} className="media-card">
                    <img src={media.url} alt={media.title || 'Media'} className="media-image" />
                    <p className="media-title">{media.title}</p>
                  </div>
                ))}
          </div>

          <div className="media-description">
            <h3 className="sub-title">Visual Storytelling & Professional Coverage</h3>
            <p>
              Whether it’s a corporate launch, private shoot, or public concert, Ethical Multimedia ensures every moment is captured in stunning clarity. From cinematic videography to detailed photography and reliable hosting—your memories and messages are in expert hands.
            </p>
          </div>
        </div>
      </section>

      {/* Hosting Event Place Section */}
      <section className="event-hosting-section">
        <h3 className="sub-title">Hosting Event Place</h3>
        <p>
          Need a location for your next shoot, seminar, or celebration? We offer fully equipped event spaces with lighting, seating, sound, and ambiance—ready for recording, streaming, or staging your unforgettable moment. Let us be your venue partner.
        </p>
      </section>

      {/* Banner Cards Section */}
      <section className="banner-cards-wrapper">
        <BannerCards endpoint="MediaHostingServicePage" />
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2 className="section-title">What Our Clients Say</h2>
        <div className="testimonials-grid">
          {loading
            ? Array(3).fill(0).map((_, i) => <SkeletonTestimonial key={i} />)
            : testimonials.slice(0, 6).map((review, idx) => (
                <div key={idx} className="testimonial-card">
                  <p className="testimonial-message">"{review.message}"</p>
                  <p className="testimonial-user">— {review.user?.username || 'Anonymous'}</p>
                </div>
              ))}
        </div>
      </section>
    </div>
  );
};

export default MediaHostingServicePage;
