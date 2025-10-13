// src/components/booking/BookingForm.jsx
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import PhoneInput from "react-phone-input-2";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";
import { toast, ToastContainer } from "react-toastify";
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers } from "react-icons/fa";

import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import bookingService from "../../api/services/bookingService";
import serviceService from "../../api/services/serviceService";
import SocialHub from "../social/SocialHub";

import "react-datepicker/dist/react-datepicker.css";
import "react-phone-input-2/lib/style.css";
import "react-toastify/dist/ReactToastify.css";
import "./BookingForm.css";
import logo from "../../assets/logo.png";

const BookingForm = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();

  // =========================
  // STATE
  // =========================
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "Ghana",
    state_or_region: "",
    venue_name: "",
    address: "",
    event_type: "",
    guests: "",
    event_date: null,
    message: "",
    services: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [servicesList, setServicesList] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // =========================
  // FETCH SERVICES
  // =========================
  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await serviceService.getServices();
        const data =
          res?.data?.results || res?.data?.data || res?.data || [];
        setServicesList(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error("Failed to fetch services.", { autoClose: 3000 });
        console.error("Service fetch error:", err);
      } finally {
        setServicesLoading(false);
      }
    };
    loadServices();
  }, []);

  // =========================
  // PREFILL USER INFO
  // =========================
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.full_name || user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  // =========================
  // FETCH BOOKING HISTORY
  // =========================
  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.email) return;
      try {
        const res = await bookingService.getUserBookings(user.email);
        setBookingHistory(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch booking history:", err);
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, [user]);

  // =========================
  // HANDLERS
  // =========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      const id = parseInt(value, 10);
      setFormData((prev) => ({
        ...prev,
        services: checked
          ? [...new Set([...prev.services, id])]
          : prev.services.filter((s) => s !== id),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (date) =>
    setFormData((prev) => ({ ...prev, event_date: date }));

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, phone: value ? `+${value}` : "" }));
  };

  const resetForm = () => {
    setFormData({
      name: user?.full_name || "",
      email: user?.email || "",
      phone: "",
      country: "Ghana",
      state_or_region: "",
      venue_name: "",
      address: "",
      event_type: "",
      guests: "",
      event_date: null,
      message: "",
      services: [],
    });
  };

  // =========================
  // SUBMIT HANDLER
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const {
      name,
      email,
      phone,
      country,
      state_or_region,
      venue_name,
      address,
      event_type,
      guests,
      event_date,
      services,
    } = formData;

    // Validation
    if (
      !name ||
      !email ||
      !phone ||
      !country ||
      !state_or_region ||
      !venue_name ||
      !address ||
      !event_date ||
      !event_type ||
      !guests ||
      !Array.isArray(services) ||
      services.length === 0
    ) {
      toast.error("Please complete all required fields.", { autoClose: 3000 });
      return;
    }

    if (!/^\+\d{8,15}$/.test(phone)) {
      toast.error("Invalid phone number format.", { autoClose: 3000 });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...formData,
      event_date: event_date ? event_date.toISOString().split("T")[0] : null,
      message: formData.message || "",
    };

    try {
      await bookingService.create(payload);
      toast.success("🎉 Booking request submitted!", { autoClose: 3000 });
      toast.info("📧 You’ll receive a confirmation email shortly.", {
        autoClose: 4000,
      });
      resetForm();
    } catch (err) {
      const response = err?.response?.data;
      let msg = "Error submitting booking.";
      if (response) {
        if (typeof response === "string") msg = response;
        else if (Array.isArray(response)) msg = response.join(" ");
        else if (typeof response === "object") {
          const first = Object.values(response)[0];
          msg = Array.isArray(first) ? first[0] : first?.toString() || msg;
        }
      }
      toast.error(msg, { autoClose: 4000 });
      console.error("Booking submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // JSX RENDER
  // =========================
  return (
    <div className={`booking-wrapper ${darkMode ? "dark" : "light"}`}>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        theme="colored"
      />

      <main className="booking-container">
        {/* === LEFT: FORM PANEL === */}
        <section className="booking-form-panel">
          <header className="form-header">
            <img src={logo} alt="Ethical Multimedia Logo" className="logo" />
            <h2>Ethical Multimedia GH</h2>
            <p className="subtitle">Premium Event Experience</p>
          </header>

          <form onSubmit={handleSubmit} className="form-content" noValidate>
            <h3>Event Booking Form</h3>

            {/* Basic Details */}
            {["name", "email", "venue_name", "address"].map((id) => (
              <div key={id} className="input-group">
                <label htmlFor={id}>{id.replace("_", " ")}</label>
                <input
                  id={id}
                  name={id}
                  type={id === "email" ? "email" : "text"}
                  value={formData[id]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}

            {/* Location */}
            <div className="input-group">
              <label>Country</label>
              <CountryDropdown
                value={formData.country}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    country: val,
                    state_or_region: "",
                  }))
                }
              />
            </div>

            <div className="input-group">
              <label>State / Region</label>
              <RegionDropdown
                country={formData.country}
                value={formData.state_or_region}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, state_or_region: val }))
                }
              />
            </div>

            {/* Contact */}
            <div className="input-group">
              <label>Phone Number</label>
              <PhoneInput
                country="gh"
                value={(formData.phone || "").replace(/^\+/, "")}
                onChange={handlePhoneChange}
                inputProps={{
                  name: "phone",
                  required: true,
                  autoComplete: "tel",
                }}
                enableSearch
                international
                preferredCountries={["gh", "us", "gb", "ng", "de"]}
              />
            </div>

            {/* Event Info */}
            <div className="input-group">
              <label>Event Type</label>
              <select
                name="event_type"
                value={formData.event_type}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Event Type --</option>
                <option value="Wedding">Wedding</option>
                <option value="Corporate">Corporate</option>
                <option value="Party">Party</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="input-group">
              <label>Number of Guests</label>
              <div className="guest-wrapper">
                <FaUsers className="icon" />
                <input
                  type="number"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  placeholder="e.g., 150"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Event Date</label>
              <div className="datepicker-wrapper">
                <FaCalendarAlt className="icon" />
                <DatePicker
                  selected={formData.event_date}
                  onChange={handleDateChange}
                  placeholderText="Select a date"
                  dateFormat="yyyy-MM-dd"
                  minDate={new Date()}
                  required
                />
              </div>
            </div>

            {/* Services */}
            <div className="input-group">
              <label>Services</label>
              <div className="checkbox-group">
                {servicesLoading ? (
                  <p>Loading services...</p>
                ) : servicesList.length > 0 ? (
                  servicesList.map((service) => (
                    <label key={service.id} className="checkbox-option">
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
                ) : (
                  <p className="no-services">No services available</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="input-group">
              <label>Additional Notes</label>
              <textarea
                name="message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Booking"}
            </button>
          </form>
        </section>

        {/* === RIGHT: SUMMARY PANEL === */}
        <aside className="booking-brand-panel">
          <div className="brand-content">
            <h3>Booking Summary</h3>
            <p>
              <strong>Name:</strong> {formData.name || "—"}
            </p>
            <p>
              <strong>Event:</strong>{" "}
              {formData.event_type || "—"} on{" "}
              {formData.event_date
                ? formData.event_date.toDateString()
                : "—"}
            </p>
            <p>
              <strong>Guests:</strong> {formData.guests || "—"}
            </p>
            <p>
              <strong>Services:</strong>{" "}
              {formData.services.length || "—"} selected
            </p>

            <hr />

            <h3>Operation Manager</h3>
            <p>
              <strong>Name:</strong> Mrs. Eunice Chai
            </p>
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:info@eethmghmultimedia.com">
                info@eethmghmultimedia.com
              </a>
            </p>
            <p>
              <strong>Phone:</strong>{" "}
              <a href="tel:+233559241828">+233 55 924 1828</a>
            </p>
            <p>
              <strong>WhatsApp:</strong>{" "}
              <a
                href="https://wa.me/233552988735"
                target="_blank"
                rel="noopener noreferrer"
              >
                +233 55 298 8735
              </a>
            </p>

            <div className="location-block">
              <h3>Headquarters</h3>
              <p>
                <FaMapMarkerAlt className="icon" /> Bicycle City, Ojobi,
                Gomoa Akotsi
              </p>
              <p>Central Region, Ghana</p>
            </div>

            <div className="contact-buttons">
              <a
                href="https://wa.me/233553424865"
                className="whatsapp"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
              <a href="tel:+233559241828" className="phone">
                Call Now
              </a>
            </div>

            {/* Social Media */}
            <SocialHub />

            {/* Booking History */}
            <div className="booking-history">
              <h3>Your Booking History</h3>
              {historyLoading ? (
                <p>Loading history...</p>
              ) : bookingHistory.length === 0 ? (
                <p>No previous bookings.</p>
              ) : (
                <ul>
                  {bookingHistory.map((b) => (
                    <li key={b.id}>
                      <strong>{b.event_type}</strong> on{" "}
                      {new Date(b.event_date).toDateString()} – {b.guests}{" "}
                      guests
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default BookingForm;
