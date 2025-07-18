import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import publicAxios from '../../api/publicAxios';
import BannerCards from '../context/BannerCards';
import MediaCard from '../context/MediaCard';
import './MediaHostingServicePage.css';
import { Card, CardContent } from '../../components/ui/card';

// Skeleton Loaders
const SkeletonCard = () => <div className="skeleton-card shimmer" />;
const SkeletonTestimonial = () => (
  <div className="testimonial-card skeleton shimmer">
    <div className="testimonial-message">Loading review...</div>
    <div className="testimonial-user">Loading...</div>
  </div>
);

const hostingServices = [
  'Videography Coverage',
  'Photography Sessions',
  'Drone Footage & Aerial Views',
  'Live Streaming & Event Recording',
  'Portrait & Studio Shoots',
  'On-site Event Hosting',
];

const MediaHostingServicePage = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const [mediaRes, reviewsRes] = await Promise.all([
        publicAxios.get('/media/featured/', {
          params: { endpoint: 'mediaHostingServicePage' },
        }),
        publicAxios.get('/reviews/'),
      ]);

      const mediaData = Array.isArray(mediaRes.data?.results) ? mediaRes.data.results : [];
      const activeMedia = mediaData.filter(item => item.is_active && item.type === 'media');
      setMediaItems(activeMedia);

      const reviewData = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];
      setTestimonials(reviewData);
    } catch (error) {
      console.error('Error fetching media hosting data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="liveband-page-container">
      {/* === Hero Banner === */}
      <section className="banner-section">
        <BannerCards endpoint="mediaHostingServicePage" title="Capture & Host with Ethical Precision" />
      </section>

      {/* === CTA Section === */}
      <section className="cta-section">
        <button className="cta-button" onClick={() => navigate('/bookings')}>
          Request Hosting Services
        </button>
      </section>

      {/* === Hosting Services === */}
      <section className="section services-section">
        <h2 className="section-title">Our Multimedia & Hosting Services</h2>
        <div className="card-grid">
          {hostingServices.map((service, index) => (
            <Card key={index} className="service-card">
              <CardContent className="card-content">{service}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* === Media Showcase === */}
      <section className="section creative-section">
        <div className="creative-layout">
          <div className="creative-text">
            <h3 className="section-subtitle">Visual Storytelling & Professional Coverage</h3>
            <p className="section-description">
              Whether it’s a corporate launch, private shoot, or public concert,
              Ethical Multimedia ensures every moment is captured in stunning clarity.
              From cinematic videography to detailed photography and reliable hosting—your memories and messages are in expert hands.
            </p>
          </div>
          <div className="creative-media">
            {loading
              ? Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)
              : Array.isArray(mediaItems)
                ? mediaItems.slice(0, 3).map((item, index) => (
                    <MediaCard key={item.id || index} media={item} />
                  ))
                : null}
          </div>
        </div>
      </section>

      {/* === Hosting Venue Info === */}
      <section className="section event-hosting-section">
        <h2 className="section-title">Hosting Event Place</h2>
        <p className="section-description">
          Need a location for your next shoot, seminar, or celebration? We offer fully equipped
          event spaces with lighting, seating, sound, and ambiance—ready for recording,
          streaming, or staging your unforgettable moment. Let us be your venue partner.
        </p>
      </section>

      {/* === Gallery Section === */}
      <section className="section">
        <h2 className="section-title">Multimedia Gallery</h2>
        <div className="card-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : Array.isArray(mediaItems)
              ? mediaItems.slice(0, 6).map((item, index) => (
                  <MediaCard key={item.id || index} media={item} />
                ))
              : null}
        </div>
      </section>

      {/* === Testimonials Section === */}
      <section className="section testimonial-section">
        <h2 className="section-title">Client Reviews</h2>
        <div className="testimonial-grid">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => <SkeletonTestimonial key={index} />)
            : Array.isArray(testimonials)
              ? testimonials.slice(0, 6).map((review, index) => (
                  <Card key={review.id || index} className="testimonial-card">
                    <CardContent>
                      <p className="testimonial-text">"{review.message}"</p>
                      <p className="testimonial-user">— {review.user?.username || 'Anonymous'}</p>
                    </CardContent>
                  </Card>
                ))
              : null}
        </div>
      </section>

      {/* === WhatsApp Button === */}
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
