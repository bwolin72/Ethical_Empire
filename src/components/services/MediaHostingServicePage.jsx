import React from 'react';
import { useNavigate } from 'react-router-dom';
import BannerCards from '../context/BannerCards';
import MediaCards from '../context/MediaCards';
import './MediaHostingServicePage.css';
import { Card, CardContent } from '../../components/ui/card';

const hostingServices = [
  'Videography Coverage',
  'Photography Sessions',
  'Drone Footage & Aerial Views',
  'Live Streaming & Event Recording',
  'Portrait & Studio Shoots',
  'On-site Event Hosting',
];

const MediaHostingServicePage = () => {
  const navigate = useNavigate();

  return (
    <div className="liveband-page-container">
      {/* === Hero Banner === */}
      <section className="banner-section">
        <BannerCards
          endpoint="mediaHostingServicePage"
          title="Capture & Host with Ethical Precision"
        />
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

      {/* === Media Preview Section === */}
      <section className="section creative-section">
        <div className="creative-layout">
          <div className="creative-text">
            <h3 className="section-subtitle">Visual Storytelling & Professional Coverage</h3>
            <p className="section-description">
              Whether it’s a corporate launch, private shoot, or public concert,
              Ethical Multimedia ensures every moment is captured in stunning clarity.
              From cinematic videography to detailed photography and reliable hosting—
              your memories and messages are in expert hands.
            </p>
          </div>
          <div className="creative-media">
            <MediaCards
              endpoint="mediaHostingServicePage"
              type="media"
              limit={3}
              fullWidth={false}
            />
          </div>
        </div>
      </section>

      {/* === Hosting Venue Info === */}
      <section className="section event-hosting-section">
        <h2 className="section-title">Hosting Event Place</h2>
        <p className="section-description">
          Need a location for your next shoot, seminar, or celebration?
          We offer fully equipped event spaces with lighting, seating, sound,
          and ambiance—ready for recording, streaming, or staging your unforgettable moment.
          Let us be your venue partner.
        </p>
      </section>

      {/* === Full Media Gallery === */}
      <section className="section">
        <h2 className="section-title">Multimedia Gallery</h2>
        <MediaCards
          endpoint="mediaHostingServicePage"
          type="media"
          limit={6}
          fullWidth={true}
        />
      </section>
    </div>
  );
};

export default MediaHostingServicePage;
