import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useMediaFetcher from '../../hooks/useMediaFetcher';
import axiosCommon from '../../api/axiosCommon';
import BannerCards from '../context/BannerCards';
import MediaCards from '../context/MediaCards';
import FadeInSection from '../FadeInSection';
import './EethmHome.css';

const serviceDetails = {
  'live-band': {
    title: 'Live Band Performance',
    description: 'Our talented musicians deliver unforgettable performances for weddings, corporate events, and private parties.',
    details: ['Customizable song lists', 'Professional sound equipment', 'Multiple band size options'],
  },
  catering: {
    title: 'Catering Services',
    description: 'Gourmet catering for all event types with customizable menus.',
    details: ['Local and international cuisine', 'Dietary restriction accommodations', 'Full-service staff available'],
  },
  decor: {
    title: 'Event Decor',
    description: 'Transform any venue into a magical space with our decor services.',
    details: ['Theme development', 'Custom installations', 'Full setup and teardown'],
  },
};

const getMediaUrl = (media) => {
  if (!media) return '';
  return media.url?.full || media.file_url || '';
};

const EethmHome = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [isMuted, setIsMuted] = useState(true);
  const [promotions, setPromotions] = useState([]);
  const [promoError, setPromoError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewError, setReviewError] = useState(null);
  const [videos, setVideos] = useState([]);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState('');
  const [newsletterError, setNewsletterError] = useState('');
  const [showNewsletterForm, setShowNewsletterForm] = useState(false);

  const {
    media: heroMediaArr,
    loading: heroLoading,
    error: heroError
  } = useMediaFetcher({ type: 'media', endpoint: 'EethmHome', isActive: true });

  const heroMedia = heroMediaArr?.[0] || null;
  const heroURL = getMediaUrl(heroMedia);
  const isImageHero = heroURL && !heroURL.endsWith('.mp4');

  const featuredVideo = videos.find(v => v.is_featured) || videos[0];
  const featuredVideoUrl = featuredVideo?.file || featuredVideo?.url || '';

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  // Fetch videos, promotions, reviews on mount
  useEffect(() => {
    const controller = new AbortController();

    // Videos - updated to match backend `/videos/` (GET) returns array
    axiosCommon.get('/videos/', { signal: controller.signal })
      .then(res => {
        const all = Array.isArray(res.data) ? res.data : [];
        const filtered = all.filter(v => v.is_active && v.endpoints?.includes('EethmHome'));
        setVideos(filtered);
      })
      .catch(err => {
        if (err.name !== 'CanceledError') {
          console.error('❌ Failed to load videos.', err);
        }
      });

    // Promotions - /promotions/active/
    axiosCommon.get('/promotions/active/', { signal: controller.signal })
      .then(res => {
        setPromotions(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        if (err.name !== 'CanceledError') {
          setPromoError('Failed to load promotions.');
        }
      });

    // Reviews - /reviews/
    axiosCommon.get('/reviews/', { signal: controller.signal })
      .then(res => {
        setReviews(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        if (err.name !== 'CanceledError') {
          setReviewError('Failed to load reviews.');
        }
      });

    return () => controller.abort();
  }, []);

  // Handle newsletter subscription
  const handleSubscribe = async (e) => {
    e.preventDefault();
    setNewsletterError('');
    setNewsletterSuccess('');

    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setNewsletterError('Please enter a valid email address.');
      return;
    }

    try {
      const response = await axiosCommon.post('/newsletter/subscribe/', {
        email: newsletterEmail,
      });
      setNewsletterSuccess('Thank you for subscribing!');
      setNewsletterEmail('');
    } catch (err) {
      setNewsletterError(err.response?.data?.error || 'Subscription failed. Please try again later.');
    }
  };

  return (
    <div className="eethm-home-page">
      <section className="video-hero-section">
        {heroLoading ? (
          <p className="video-fallback">Loading hero...</p>
        ) : heroError ? (
          <p className="video-fallback" style={{ color: 'var(--color-error)' }}>{heroError}</p>
        ) : featuredVideoUrl ? (
          <>
            <video
              ref={videoRef}
              className="background-media"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="auto"
            >
              <source src={featuredVideoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            <div className="overlay-content">
              <h1>Ethical Multimedia GH Services</h1>
              <p>Live Band • Catering • Multimedia • Decor Services</p>

              <div className="hero-buttons">
                <button onClick={() => navigate('/bookings')} className="btn-primary">Book Now</button>

                <button onClick={() => setShowNewsletterForm(true)} className="btn-secondary newsletter-btn">
                  📩 Subscribe to Newsletter
                </button>
              </div>
            </div>

            <button
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
              className="mute-button"
              onClick={toggleMute}
              type="button"
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </>
        ) : isImageHero ? (
          <>
            <img src={heroURL} alt="Hero" className="background-media" loading="lazy" />
            <div className="overlay-content">
              <h1>Ethical Multimedia GH Services</h1>
              <p>Live Band • Catering • Multimedia • Decor Services</p>
              <button onClick={() => setShowNewsletterForm(true)} className="btn-secondary newsletter-btn hero-image-subscribe">
                📩 Subscribe to Newsletter
              </button>
            </div>
          </>
        ) : (
          <p className="video-fallback">No hero media or video available.</p>
        )}
      </section>

      {/* Newsletter subscription modal */}
      {showNewsletterForm && (
        <div className="newsletter-modal-backdrop" onClick={() => setShowNewsletterForm(false)}>
          <div className="newsletter-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowNewsletterForm(false)} aria-label="Close newsletter form">&times;</button>
            <h2>Subscribe to Our Newsletter</h2>
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input
                type="email"
                placeholder="Your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                aria-label="Email address"
                autoFocus
              />
              <button type="submit" className="btn-primary">Subscribe</button>
            </form>
            {newsletterSuccess && <p className="success-message">{newsletterSuccess}</p>}
            {newsletterError && <p className="error-message">{newsletterError}</p>}
          </div>
        </div>
      )}

      <FadeInSection>
        <section className="services-page">
          <h2>Our Services</h2>
          <div className="service-list">
            {Object.entries(serviceDetails).map(([key, service]) => (
              <div key={key} className="service-item">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <ul>
                  {service.details.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
                <a href={`/services/${key}`}>Learn more</a>
              </div>
            ))}
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section className="promotions-section">
          <h2>Current Offers</h2>
          {promotions.length > 0 ? (
            <div className="promos-container">
              {promotions.map(promo => (
                <div key={promo.id} className="promo-card">
                  {promo.image_url && (
                    <img
                      src={promo.image_url}
                      alt={promo.title}
                      loading="lazy"
                      onError={(e) => (e.target.style.display = 'none')}
                    />
                  )}
                  <div className="promo-content">
                    <h3>{promo.title}</h3>
                    <p>{promo.description}</p>
                    {promo.discount_percentage && (
                      <p className="discount">Save {promo.discount_percentage}%</p>
                    )}
                    <p className="validity">
                      Valid: {promo.valid_from} – {promo.valid_to}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : promoError ? (
            <p style={{ color: 'var(--color-error)' }}>{promoError}</p>
          ) : (
            <p>No current promotions.</p>
          )}
        </section>
      </FadeInSection>

      <FadeInSection>
        <section className="reviews-section">
          <h2>What Our Clients Say</h2>
          {reviews.length > 0 ? (
            <div className="reviews-container">
              {reviews.map(review => (
                <div key={review.id} className="review-card">
                  <p className="review-text">"{review.comment}"</p>
                  <p className="review-author">— {review.name || 'Anonymous'}</p>
                </div>
              ))}
            </div>
          ) : reviewError ? (
            <p style={{ color: 'var(--color-error)' }}>{reviewError}</p>
          ) : (
            <p>No client reviews available.</p>
          )}
        </section>
      </FadeInSection>

      <FadeInSection>
        <section className="banners-section">
          <h2>Highlights from Our Services</h2>
          <BannerCards endpoint="EethmHome" />
        </section>
      </FadeInSection>

      <FadeInSection>
        <section className="banners-section">
          <h2>Featured Media</h2>
          <MediaCards endpoint="EethmHome" type="media" />
        </section>
      </FadeInSection>
    </div>
  );
};

export default EethmHome;
