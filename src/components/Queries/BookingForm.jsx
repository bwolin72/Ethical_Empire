// src/components/booking/BookingForm.jsx
import React, { useState, useEffect, useMemo } from "react";
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

// helper to normalize array data
const toArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const formatPhoneForApi = (raw) => {
  if (!raw) return "";
  let val = raw.toString().trim();
  if (!val.startsWith("+")) val = `+${val}`;
  return val.replace(/\s+/g, "");
};

const BookingForm = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();

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

  // Prefill user info
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.full_name || user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  // Fetch services
  useEffect(() => {
    let mounted = true;
    const fetchServices = async () => {
      try {
        const res = await serviceService.getServices();
        const data = res?.data ?? res?.data?.results ?? res?.data?.data ?? [];
        if (mounted) setServicesList(toArray(data));
      } catch (err) {
        console.error("Failed to fetch services:", err);
        toast.error("Failed to fetch services.");
      } finally {
        if (mounted) setServicesLoading(false);
      }
    };
    fetchServices();
    return () => (mounted = false);
  }, []);

  // Fetch booking history
  useEffect(() => {
    let mounted = true;
    const fetchHistory = async () => {
      if (!user?.email) return;
      try {
        const res = await bookingService.getUserBookings(user.email);
        if (mounted) setBookingHistory(toArray(res?.data));
      } catch (err) {
        console.error("Failed to fetch booking history:", err);
      } finally {
        if (mounted) setHistoryLoading(false);
      }
    };
    fetchHistory();
    return () => (mounted = false);
  }, [user]);

  // Derived selections
  const selectedServiceObjects = useMemo(() => {
    const map = new Map(servicesList.map((s) => [Number(s.id ?? s._id), s]));
    return formData.services.map((id) => map.get(Number(id))).filter(Boolean);
  }, [formData.services, servicesList]);

  const totalPrice = useMemo(
    () => selectedServiceObjects.reduce((sum, s) => sum + (Number(s.price) || 0), 0),
    [selectedServiceObjects]
  );

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      const id = Number(value);
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

  const handlePhoneChange = (value) =>
    setFormData((prev) => ({ ...prev, phone: value ? `+${value}` : "" }));

  const handleDateChange = (date) =>
    setFormData((prev) => ({ ...prev, event_date: date }));

  const toggleServiceCard = (id) => {
    const numeric = Number(id);
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(numeric)
        ? prev.services.filter((s) => s !== numeric)
        : [...prev.services, numeric],
    }));
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

  const isPhoneValidForApi = (p) => /^\+\d{8,15}$/.test(formatPhoneForApi(p));

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

    if (
      !name ||
      !email ||
      !phone ||
      !country ||
      !state_or_region ||
      !venue_name ||
      !address ||
      !event_type ||
      !guests ||
      !event_date ||
      services.length === 0
    ) {
      toast.error("Please fill all required fields and select at least one service.");
      return;
    }

    if (!isPhoneValidForApi(phone)) {
      toast.error("Invalid phone number. Example: +233123456789");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name,
      email,
      phone: formatPhoneForApi(phone),
      country,
      state_or_region,
      venue_name,
      address,
      event_type,
      guests,
      event_date: event_date.toISOString().split("T")[0],
      message: formData.message,
      services,
    };

    try {
      await bookingService.create(payload);
      toast.success("🎉 Booking submitted successfully!");
      resetForm();
    } catch (err) {
      const response = err?.response?.data;
      let msg = "Error submitting form.";
      if (response) {
        if (typeof response === "string") msg = response;
        else if (Array.isArray(response)) msg = response.join(" ");
        else if (typeof response === "object") {
          const first = Object.values(response)[0];
          msg = Array.isArray(first) ? first[0] : first?.toString() || msg;
        }
      }
      toast.error(msg);
      console.error("Booking submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // === RENDER ===
  return (
    <div className={`booking-wrapper ${darkMode ? "dark" : "light"}`}>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar theme="colored" />

      <div className="booking-container">
        {/* Left: Form */}
        <div className="booking-form-panel" role="region" aria-labelledby="booking-form-heading">
          <div className="form-header">
            <img src={logo} alt="Ethical Multimedia Logo" className="logo" />
            <div>
              <h2 id="booking-form-heading">Ethical Multimedia GH</h2>
              <p className="subtitle">Premium Event Experience</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-content" noValidate>
            <h3>Event Booking Form</h3>

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

            <div className="input-group">
              <label>Country</label>
              <CountryDropdown
                value={formData.country}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, country: val, state_or_region: "" }))
                }
                classes="country-dropdown"
              />
            </div>

            <div className="input-group">
              <label>State / Region</label>
              <RegionDropdown
                country={formData.country}
                value={formData.state_or_region}
                onChange={(val) => setFormData((prev) => ({ ...prev, state_or_region: val }))}
                classes="region-dropdown"
              />
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <PhoneInput
                country="gh"
                value={(formData.phone || "").replace(/^\+/, "")}
                onChange={handlePhoneChange}
                inputProps={{ name: "phone", required: true, autoComplete: "tel" }}
                enableSearch
                international
                preferredCountries={["gh", "us", "gb", "ng", "de"]}
              />
            </div>

            <div className="input-group">
              <label>Event Type</label>
              <select name="event_type" value={formData.event_type} onChange={handleChange} required>
                <option value="">-- Select Event Type --</option>
                <option value="Wedding">Wedding</option>
                <option value="Corporate">Corporate</option>
                <option value="Party">Party</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="input-group">
              <label>Guests</label>
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

            <div className="input-group services-grid">
              <label>Services (select at least one)</label>
              {servicesLoading ? (
                <p className="muted-text">Loading services…</p>
              ) : servicesList.length > 0 ? (
                <div className="service-cards">
                  {servicesList.map((s) => {
                    const sid = Number(s.id ?? s._id);
                    const active = formData.services.includes(sid);
                    return (
                      <button
                        key={sid}
                        type="button"
                        className={`service-card ${active ? "active" : ""}`}
                        onClick={() => toggleServiceCard(sid)}
                      >
                        <div className="service-card-body">
                          <div className="service-card-title">{s.name}</div>
                          {s.price != null && (
                            <div className="service-card-price">
                              ₵{Number(s.price).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="muted-text">No services available at the moment.</p>
              )}
            </div>

            <div className="input-group">
              <label>Additional Notes</label>
              <textarea
                name="message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Booking"}
              </button>
              <button type="button" className="reset-btn" onClick={resetForm}>
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Right: Summary Panel */}
        <aside className="booking-brand-panel" aria-labelledby="summary-heading">
          <div className="brand-content">
            <h3 id="summary-heading">Booking Summary</h3>

            <div className="summary-row">
              <strong>Name:</strong> <span>{formData.name || "—"}</span>
            </div>
            <div className="summary-row">
              <strong>Event:</strong>{" "}
              <span>{formData.event_type || "—"}</span>
            </div>
            <div className="summary-row">
              <strong>Date:</strong>{" "}
              <span>{formData.event_date ? formData.event_date.toDateString() : "—"}</span>
            </div>
            <div className="summary-row">
              <strong>Guests:</strong> <span>{formData.guests || "—"}</span>
            </div>

            <hr />
            <h4>Selected Services</h4>
            {selectedServiceObjects.length === 0 ? (
              <p className="muted-text">No services selected.</p>
            ) : (
              <ul className="selected-services">
                {selectedServiceObjects.map((s) => (
                  <li key={s.id}>
                    <span>{s.name}</span>
                    <span>₵{(Number(s.price) || 0).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="total-row">
              <strong>Total:</strong>{" "}
              <span className="total-amount">₵{totalPrice.toFixed(2)}</span>
            </div>

            <hr />
            <h3>Operation Manager</h3>
            <p><strong>Name:</strong> Mrs. Eunice Chai</p>
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:info@eethmghmultimedia.com">info@eethmghmultimedia.com</a>
            </p>
            <p>
              <strong>Phone:</strong>{" "}
              <a href="tel:+233559241828">+233 55 924 1828</a>
            </p>

            <div className="location-block">
              <h4>Headquarters</h4>
              <p><FaMapMarkerAlt className="icon" /> Bicycle City, Ojobi, Gomoa Akotsi</p>
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

            <SocialHub />

            <div className="booking-history">
              <h4>Your Booking History</h4>
              {historyLoading ? (
                <p>Loading history...</p>
              ) : bookingHistory.length === 0 ? (
                <p>No previous bookings.</p>
              ) : (
                <ul>
                  {bookingHistory.map((b) => (
                    <li key={b.id}>
                      <strong>{b.event_type}</strong> on{" "}
                      {new Date(b.event_date).toDateString()} – {b.guests} guests
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BookingForm;
