// src/components/Booking/BookingForm.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import DatePicker from 'react-datepicker';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { toast, ToastContainer } from 'react-toastify';
import { FaCalendarAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css';
import logo from '../../assets/logo.png';
import './BookingForm.css';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const BookingForm = () => {
  const { darkMode } = useTheme();
  const { isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    event_date: null,
    address: '',
    message: '',
    services: [],
  });

  const [availableServices, setAvailableServices] = useState([]);
  const [showServices, setShowServices] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill name/email from user context
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.full_name || user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const fetchServices = useCallback(() => {
    axiosInstance
      .get('/services/')
      .then((res) => {
        const data = Array.isArray(res.data.results) ? res.data.results : res.data;
        if (Array.isArray(data) && data.length > 0) {
          setAvailableServices(data);
        } else {
          toast.warning('No services available at the moment.', { autoClose: 3000 });
        }
      })
      .catch((err) => {
        console.error('Failed to fetch services:', err);
        toast.error('Failed to fetch services.', { autoClose: 3000 });
      });
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const id = parseInt(value, 10);
      setFormData((prev) => ({
        ...prev,
        services: checked
          ? [...new Set([...prev.services, id])]
          : prev.services.filter((s) => s !== id),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      event_date: date,
    }));
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      phone: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: user?.full_name || '',
      email: user?.email || '',
      phone: '',
      event_date: null,
      address: '',
      message: '',
      services: [],
    });
    setShowServices(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('[BookingForm] Submitting...');
    if (!isAuthenticated) {
      toast.error('You must be logged in to submit a booking.', { autoClose: 3000 });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...formData,
      event_date: formData.event_date
        ? formData.event_date.toISOString().split('T')[0]
        : null,
    };

    try {
      await axiosInstance.post('/bookings/create/', payload);

      toast.success('🎉 Booking request submitted successfully!', { autoClose: 3000 });
      toast.info('📧 A confirmation email has been sent to you.', { autoClose: 4000 });

      resetForm();
    } catch (err) {
      console.error('[BookingForm] Submit error:', err.response?.data || err.message);
      const response = err.response?.data;
      const extractedError =
        typeof response === 'object' && response !== null
          ? Object.values(response)[0]
          : response?.detail;

      toast.error(
        Array.isArray(extractedError)
          ? extractedError[0]
          : extractedError || 'Error occurred submitting form.',
        { autoClose: 3000 }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`booking-form-container ${darkMode ? 'dark' : 'light'}`}>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar theme="colored" />
      <div className="form-header">
        <img src={logo} alt="Ethical Multimedia Logo" className="form-logo" />
        <h2>Ethical Multimedia GH</h2>
        <p className="subtitle">Reserve your event with elegance</p>
      </div>

      <form onSubmit={handleSubmit} className="form-grid" noValidate>
        {['name', 'email', 'address'].map((field) => (
          <div className="form-group" key={field}>
            <label htmlFor={field}>
              {field === 'email'
                ? 'Email Address'
                : field === 'address'
                ? 'Event Venue'
                : 'Full Name'}
            </label>
            <input
              id={field}
              name={field}
              type={field === 'email' ? 'email' : 'text'}
              value={formData[field]}
              onChange={handleChange}
              required
            />
          </div>
        ))}

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <PhoneInput
            country={'gh'}
            value={formData.phone}
            onChange={handlePhoneChange}
            inputProps={{
              name: 'phone',
              required: true,
              autoFocus: false,
            }}
            enableSearch
            disableDropdown={false}
          />
        </div>

        <div className="form-group">
          <label htmlFor="event_date">Event Date</label>
          <div className="calendar-input-container">
            <FaCalendarAlt className="calendar-icon" />
            <DatePicker
              id="event_date"
              selected={formData.event_date}
              onChange={handleDateChange}
              placeholderText="Select a date"
              className="date-picker"
              dateFormat="yyyy-MM-dd"
              required
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label
            htmlFor="services"
            className="dropdown-label"
            onClick={() => setShowServices((prev) => !prev)}
            aria-expanded={showServices}
          >
            Select Services{' '}
            {showServices ? (
              <FaChevronUp className="dropdown-icon" />
            ) : (
              <FaChevronDown className="dropdown-icon" />
            )}
          </label>

          {showServices && (
            <fieldset className="service-dropdown" id="services">
              {availableServices.length === 0 ? (
                <p className="no-services-text">No services available at the moment.</p>
              ) : (
                availableServices.map((service) => (
                  <label key={service.id} className="service-option">
                    <input
                      type="checkbox"
                      name="services"
                      value={service.id}
                      checked={formData.services.includes(service.id)}
                      onChange={handleChange}
                    />
                    {service.name} — GH₵{service.price}
                  </label>
                ))
              )}
            </fieldset>
          )}
        </div>

        <div className="form-group full-width">
          <label htmlFor="message">Additional Notes</label>
          <textarea
            id="message"
            name="message"
            rows="4"
            value={formData.message}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="submit-btn full-width" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Booking'}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
