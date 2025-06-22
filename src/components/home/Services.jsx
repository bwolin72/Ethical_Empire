import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
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
      const res = await axiosInstance.get('/services/');
      setServices(res.data);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceDetail = async (slug) => {
    try {
      const res = await axiosInstance.get(`/services/${slug}/`);
      setSelectedService(res.data);
    } catch (error) {
      console.error('Failed to load service detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="services-page"><p>Loading services...</p></div>;
  }

  return (
    <div className="services-page">
      {selectedService ? (
        <div className="service-detail">
          <h2>{selectedService.title}</h2>
          <p>{selectedService.description}</p>
          {selectedService.details && selectedService.details.length > 0 && (
            <ul>
              {selectedService.details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          )}
          <Link to="/services" className="back-link">← Back to All Services</Link>
        </div>
      ) : (
        <>
          <h2>Our Services</h2>
          <div className="service-list">
            {services.map((srv) => (
              <div key={srv.slug} className="service-item">
                <h3>{srv.title}</h3>
                <p>{srv.description}</p>
                <Link to={`/services/${srv.slug}`} className="learn-more">
                  Learn more →
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Services;
