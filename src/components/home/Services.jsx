// src/components/Services.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './Services.css';

const serviceDetails = {
  'live-band': {
    title: 'Live Band Performance',
    description:
      'Our talented musicians deliver unforgettable performances for weddings, corporate events, and private parties.',
    details: [
      'Customizable song lists',
      'Professional sound equipment',
      'Multiple band size options',
    ],
  },
  catering: {
    title: 'Catering Services',
    description:
      'Gourmet catering for all event types with customizable menus.',
    details: [
      'Local and international cuisine',
      'Dietary restriction accommodations',
      'Full-service staff available',
    ],
  },
  decor: {
    title: 'Event Decor',
    description:
      'Transform any venue into a magical space with our decor services.',
    details: ['Theme development', 'Custom installations', 'Full setup and teardown'],
  },
};

function Services() {
  const { service } = useParams();
  const selectedService = service ? serviceDetails[service] : null;

  return (
    <div className="services-page">
      {selectedService ? (
        <div className="service-detail">
          <h2>{selectedService.title}</h2>
          <p>{selectedService.description}</p>
          <ul>
            {selectedService.details.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
          <Link to="/services" className="back-link">← Back to All Services</Link>
        </div>
      ) : (
        <>
          <h2 className="services-heading">Our Services</h2>
          <div className="service-list">
            {Object.entries(serviceDetails).map(([key, service]) => (
              <div key={key} className="service-item">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link to={`/services/${key}`} className="learn-more">
                  Learn more →
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Services;
