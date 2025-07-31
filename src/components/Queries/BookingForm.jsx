// BookingForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import DatePicker from 'react-datepicker';
import PhoneInput from 'react-phone-input-2';
import { toast, ToastContainer } from 'react-toastify';
import { FaCalendarAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-phone-input-2/lib/style.css';
import 'react-toastify/dist/ReactToastify.css';
import './BookingForm.css';
import logo from '../../assets/logo.png';

const BookingForm = () => {
  const { darkMode } = useTheme();
  const { isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    state_or_region: '',
    venue_name: '',
    address: '',
    event_date: null,
    message: '',
    services: [],
  });

  const [availableServices, setAvailableServices] = useState([]);
  const [showServices, setShowServices] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    axiosInstance.get('/services/')
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
      phone: `+${value}`,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: user?.full_name || '',
      email: user?.email || '',
      phone: '',
      country: '',
      state_or_region: '',
      venue_name: '',
      address: '',
      event_date: null,
      message: '',
      services: [],
    });
    setShowServices(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const {
      name, email, phone, country, state_or_region,
      venue_name, address, event_date, services
    } = formData;

    if (
      !isAuthenticated ||
      !name || !email || !phone || !country || !state_or_region ||
      !venue_name || !address || !event_date || services.length === 0
    ) {
      toast.error('Please complete all required fields and select at least one service.', { autoClose: 3000 });
      return;
    }

    if (!/^\\+\d{7,15}$/.test(phone)) {
      toast.error('Please enter a valid international phone number.', { autoClose: 3000 });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...formData,
      event_date: event_date?.toISOString().split('T')[0],
    };

    try {
      await axiosInstance.post('/bookings/submit/', payload);
      toast.success('🎉 Booking request submitted successfully!', { autoClose: 3000 });
      toast.info('📧 A confirmation email has been sent to you.', { autoClose: 4000 });
      resetForm();
    } catch (err) {
      const response = err.response?.data;
      const extractedError =
        typeof response === 'object' && response !== null
          ? Object.values(response)[0]
          : response?.detail;

      toast.error(
        Array.isArray(extractedError) ? extractedError[0] : extractedError || 'Error occurred submitting form.',
        { autoClose: 3000 }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`booking-page ${darkMode ? 'dark' : 'light'}`}>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar theme="colored" />
      <div className="booking-wrapper">
        <form onSubmit={handleSubmit} className="booking-form" noValidate>
          <h2>Book Your Event</h2>

          {[{ id: 'name', label: 'Full Name' },
            { id: 'email', label: 'Email Address', type: 'email' },
            { id: 'country', label: 'Country' },
            { id: 'state_or_region', label: 'State or Region' },
            { id: 'venue_name', label: 'Venue Name (Alias)' },
            { id: 'address', label: 'Full Address / Directions' }
          ].map(({ id, label, type = 'text' }) => (
            <div className="form-group" key={id}>
              <label htmlFor={id}>{label}</label>
              <input
                id={id}
                name={id}
                type={type}
                value={formData[id]}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <PhoneInput
              country={'gh'}
              value={formData.phone.replace(/^\+/, '')}
              onChange={handlePhoneChange}
              inputProps={{ name: 'phone', required: true }}
              enableSearch
              international
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
              {showServices ? <FaChevronUp className="dropdown-icon" /> : <FaChevronDown className="dropdown-icon" />}
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
                      {service.name}
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

        <div className="booking-right-panel">
          <img src={logo} alt="Ethical Multimedia Logo" className="right-logo" />
          <h2>Ethical Multimedia GH</h2>
          <p>Book your premium event experience</p>
          <p className="animated-text">✨ Music | Media | Events | Rentals</p>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
