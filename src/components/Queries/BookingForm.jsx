import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../assets/logo.png';
import './BookingForm.css';

const BookingForm = () => {
  const { darkMode } = useTheme();

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
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setFormData((prev) => ({
        ...prev,
        name: user.full_name || '',
        email: user.email || '',
      }));
    }
  }, []);

  const fetchServices = useCallback(() => {
    axiosInstance
      .get('/services/')
      .then((res) => setAvailableServices(res.data))
      .catch((err) => console.error('Failed to fetch services:', err));
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

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
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
    setSuccessMessage('');
    setErrorMessage('');
    setIsSubmitting(true);

    const token = localStorage.getItem('access');
    if (!token) {
      setErrorMessage('You must be logged in to submit a booking.');
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      message: formData.message,
      event_date: formData.event_date
        ? formData.event_date.toISOString().split('T')[0]
        : null,
      services: formData.services,
    };

    try {
      await axiosInstance.post('/bookings/create/', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMessage('🎉 Booking request submitted successfully!');
      resetForm();
    } catch (err) {
      const response = err.response?.data;
      const extractedError =
        typeof response === 'object' && response !== null
          ? Object.values(response)[0]
          : response?.detail;

      setErrorMessage(
        Array.isArray(extractedError)
          ? extractedError[0]
          : extractedError || 'An error occurred while submitting the form.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`booking-form-container ${darkMode ? 'dark' : 'light'}`}>
      <div className="form-header">
        <img src={logo} alt="Ethical Multimedia Logo" className="form-logo" />
        <h2>Ethical Multimedia GH</h2>
        <p className="subtitle">Reserve your event with elegance</p>
      </div>

      <form onSubmit={handleSubmit} className="form-grid" noValidate>
        {['name', 'email', 'phone', 'address'].map((field) => (
          <div className="form-group" key={field}>
            <label htmlFor={field}>
              {field === 'email'
                ? 'Email Address'
                : field === 'phone'
                ? 'Phone Number'
                : field === 'address'
                ? 'Event Venue'
                : 'Full Name'}
            </label>
            <input
              id={field}
              name={field}
              type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
              value={formData[field]}
              onChange={handleChange}
              required
            />
          </div>
        ))}

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
              {availableServices.map((service) => (
                <label key={service.id} className="service-option">
                  <input
                    type="checkbox"
                    name="services"
                    value={service.id}
                    checked={formData.services.includes(service.id)}
                    onChange={handleChange}
                  />
                  {service.name} — ${service.price}
                </label>
              ))}
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

        <button
          type="submit"
          className="submit-btn full-width"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Booking'}
        </button>

        {successMessage && <p className="success-msg">{successMessage}</p>}
        {errorMessage && <p className="error-msg">{errorMessage}</p>}
      </form>
    </div>
  );
};

export default BookingForm;
