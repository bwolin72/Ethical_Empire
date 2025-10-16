import React, { useState, useEffect } from "react";
import bookingService from "../../api/services/bookingService";
import serviceService from "../../api/services/serviceService"; // assumed endpoint for listing services
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";
import { toast } from "react-toastify";
import "./BookingForm.css";

const BookingForm = () => {
  // ===============================
  // 🔹 STATE
  // ===============================
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    state_or_region: "",
    venue_name: "",
    address: "",
    event_date: "",
    message: "",
    services: [],
  });

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ===============================
  // 🔹 LOAD AVAILABLE SERVICES
  // ===============================
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const res = await serviceService.list();
        setServices(res.data || []);
      } catch (error) {
        console.error("Failed to load services:", error);
        toast.error("Could not load available services.");
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, []);

  // ===============================
  // 🔹 HANDLE INPUTS
  // ===============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCountryChange = (country) => {
    setFormData((prev) => ({ ...prev, country }));
  };

  const handleRegionChange = (region) => {
    setFormData((prev) => ({ ...prev, state_or_region: region }));
  };

  const toggleService = (id) => {
    setFormData((prev) => {
      const selected = new Set(prev.services);
      selected.has(id) ? selected.delete(id) : selected.add(id);
      return { ...prev, services: Array.from(selected) };
    });
  };

  // ===============================
  // 🔹 TOTAL PRICE
  // ===============================
  const totalPrice = formData.services
    .map((sid) => services.find((s) => s.id === sid)?.price || 0)
    .reduce((a, b) => a + b, 0);

  // ===============================
  // 🔹 SUBMIT FORM
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await bookingService.create(formData);
      toast.success("Booking submitted successfully!");
      console.log("✅ Booking created:", res.data);

      setFormData({
        name: "",
        email: "",
        phone: "",
        country: "",
        state_or_region: "",
        venue_name: "",
        address: "",
        event_date: "",
        message: "",
        services: [],
      });
    } catch (err) {
      console.error("Booking failed:", err);
      const msg = err.response?.data?.detail || "Failed to submit booking.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ===============================
  // 🔹 RENDER
  // ===============================
  return (
    <div className="booking-container glassmorphic">
      <h1 className="booking-title">Book Our Services</h1>
      <form className="booking-form" onSubmit={handleSubmit}>
        {/* Personal Info */}
        <div className="form-section">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Phone (Intl format)</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+233567876456"
            required
          />
        </div>

        {/* Location */}
        <div className="form-section">
          <label>Country</label>
          <CountryDropdown
            value={formData.country}
            onChange={handleCountryChange}
            classes="dropdown"
          />

          <label>State / Region</label>
          <RegionDropdown
            country={formData.country}
            value={formData.state_or_region}
            onChange={handleRegionChange}
            classes="dropdown"
          />

          <label>Venue Name</label>
          <input
            type="text"
            name="venue_name"
            value={formData.venue_name}
            onChange={handleChange}
            required
          />

          <label>Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        {/* Event */}
        <div className="form-section">
          <label>Event Date</label>
          <input
            type="date"
            name="event_date"
            value={formData.event_date}
            onChange={handleChange}
            required
          />

          <label>Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={3}
            placeholder="Any special requests..."
          />
        </div>

        {/* Services */}
        <div className="form-section services-list">
          <h2>Select Services</h2>
          {loading ? (
            <p>Loading services...</p>
          ) : services.length > 0 ? (
            services.map((service) => (
              <div key={service.id} className="service-item">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.services.includes(service.id)}
                    onChange={() => toggleService(service.id)}
                  />
                  {service.name} — <span className="price">${service.price}</span>
                </label>
              </div>
            ))
          ) : (
            <p>No services available.</p>
          )}
        </div>

        {/* Total */}
        <div className="total-section">
          <strong>Total:</strong> ${totalPrice.toFixed(2)}
        </div>

        {/* Submit */}
        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Booking"}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
