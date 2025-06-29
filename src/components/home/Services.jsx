import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import publicAxios from '../../api/publicAxios';
import './Services.css';

const Services = () => {
  const { service } = useParams();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (service) {
      fetchServiceDetail(service);
    } else {
      fetchAllServices();
    }
  }, [service]);

  const fetchAllServices = async () => {
    try {
      const res = await publicAxios.get('/services/');
      setServices(res.data);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceDetail = async (slug) => {
    try {
      const res = await publicAxios.get(`/services/${slug}/`);
      setSelectedService(res.data);
    } catch (error) {
      console.error('Failed to load service detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="services-page">
        <p>Loading services...</p>
      </div>
    );
  }

  return (
    <div className="services-page">
      {selectedService ? (
        <section className="service-detail">
          <h2 className="section-heading">{selectedService.title}</h2>
          <p className="service-description">{selectedService.description}</p>
          {selectedService.details && selectedService.details.length > 0 && (
            <ul className="service-details-list">
              {selectedService.details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          )}
          <Link to="/services" className="back-link">
            ← Back to All Services
          </Link>
        </section>
      ) : (
        <>
          <h2 className="section-heading">Our Services</h2>
          <section className="service-list">
            {services.map((srv) => (
              <div key={srv.slug} className="service-item">
                <h3>{srv.title}</h3>
                <p>{srv.description}</p>
                <Link to={`/services/${srv.slug}`} className="learn-more">
                  Learn more →
                </Link>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
};

export default Services;
