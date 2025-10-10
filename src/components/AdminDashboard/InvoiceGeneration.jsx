// src/components/admin/InvoiceGeneration.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import bookingService from "../../api/services/bookingService";
import serviceService from "../../api/services/serviceService";
import invoiceService from "../../api/services/invoiceService";
import "../styles/ui.css"; // ✅ unified theme & layout variables
import "./InvoiceGeneration.css"; // ✅ component-specific layout tweaks

const InvoiceGeneration = () => {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("none");
  const [creating, setCreating] = useState(false);
  const [createdInvoiceId, setCreatedInvoiceId] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // Fetch bookings + services (Admin)
  // =====================================================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookingsRes, servicesRes] = await Promise.all([
          bookingService.adminList(),
          serviceService.getServices(),
        ]);

        const bookingData = Array.isArray(bookingsRes.data)
          ? bookingsRes.data
          : bookingsRes.data?.results || [];

        const serviceData = Array.isArray(servicesRes.data)
          ? servicesRes.data
          : servicesRes.data?.results || [];

        setBookings(bookingData);
        setServices(serviceData);
      } catch (err) {
        console.error("[InvoiceGeneration] Fetch error:", err);
        setMessage("❌ Failed to load bookings or services.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // =====================================================
  // Helpers
  // =====================================================
  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "N/A");
  const resetInvoiceState = () => {
    setCreatedInvoiceId(null);
    setPdfPreviewUrl(null);
    setPaymentStatus("none");
    setMessage("");
  };

  const booking = bookings.find((b) => b.id === selectedId);
  const serviceList = Array.isArray(booking?.services) ? booking.services : [];

  const resolvedServices = serviceList
    .map((svc) =>
      typeof svc === "object" ? svc : services.find((s) => s.id === svc)
    )
    .filter(Boolean);

  const total = resolvedServices.reduce(
    (sum, s) => sum + parseFloat(s.price || 0),
    0
  );

  const paid =
    paymentStatus === "full" ? total : paymentStatus === "half" ? total / 2 : 0;

  const remaining = total - paid;

  // =====================================================
  // Invoice Actions
  // =====================================================
  const createInvoice = async () => {
    if (!booking) return;
    setCreating(true);
    setMessage("");
    setPdfPreviewUrl(null);

    try {
      const data = await invoiceService.createBookingInvoice(
        booking.id,
        paymentStatus
      );
      const newId = data?.id;
      if (!newId) throw new Error("Invoice ID missing in response.");

      setCreatedInvoiceId(newId);
      setMessage("✅ Invoice created successfully.");
      await fetchInvoicePDF(newId);
    } catch (err) {
      console.error("[InvoiceGeneration] Create error:", err);
      setMessage("❌ Error creating invoice.");
    } finally {
      setCreating(false);
    }
  };

  const fetchInvoicePDF = async (invoiceId) => {
    try {
      const previewUrl = await invoiceService.downloadInvoicePdf(invoiceId, {
        autoDownload: false,
      });
      setPdfPreviewUrl(previewUrl);
    } catch (err) {
      console.error("[InvoiceGeneration] PDF fetch error:", err);
      setMessage("❌ Could not load PDF preview.");
    }
  };

  const downloadInvoice = async () => {
    if (!createdInvoiceId) return;
    try {
      await invoiceService.downloadInvoicePdf(createdInvoiceId, {
        autoDownload: true,
      });
    } catch (err) {
      console.error("[InvoiceGeneration] Download error:", err);
      setMessage("❌ Failed to download PDF.");
    }
  };

  const sendInvoiceEmail = async () => {
    if (!createdInvoiceId) return;
    try {
      await invoiceService.emailInvoice(createdInvoiceId);
      setMessage("📧 Invoice sent successfully via email.");
    } catch (err) {
      console.error("[InvoiceGeneration] Email error:", err);
      setMessage("❌ Failed to send invoice email.");
    }
  };

  // =====================================================
  // Render
  // =====================================================
  return (
    <div className="invoice-container theme-surface">
      {/* Sidebar */}
      <motion.aside
        className="invoice-sidebar"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="sidebar-title">Bookings</h2>
        {loading ? (
          <p className="muted">Loading bookings...</p>
        ) : bookings.length ? (
          bookings.map((b) => (
            <div
              key={b.id}
              onClick={() => {
                setSelectedId(b.id);
                resetInvoiceState();
              }}
              className={`invoice-item ${
                b.id === selectedId ? "active" : ""
              }`}
            >
              <strong>{b.name}</strong>
              <span>{formatDate(b.event_date)}</span>
            </div>
          ))
        ) : (
          <p className="muted">No bookings found.</p>
        )}
      </motion.aside>

      {/* Main Content */}
      <motion.main
        className="invoice-main"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {booking ? (
          <>
            <h2>{booking.name}</h2>
            <div className="invoice-info">
              <p>
                <strong>Booking Date:</strong> {formatDate(booking.created_at)}
              </p>
              <p>
                <strong>Event Date:</strong> {formatDate(booking.event_date)}
              </p>
              <p>
                <strong>Phone:</strong> {booking.phone}
              </p>
              <p>
                <strong>Venue:</strong> {booking.address || "N/A"}
              </p>
              <p>
                <strong>Services:</strong>{" "}
                {resolvedServices.map((s) => s.name).join(", ") || "N/A"}
              </p>
              <p>
                <strong>Total:</strong> GHS {total.toFixed(2)}
              </p>
            </div>

            {/* Payment Options */}
            <div className="payment-options">
              {["none", "half", "full"].map((option) => (
                <label key={option}>
                  <input
                    type="radio"
                    name="payment"
                    value={option}
                    checked={paymentStatus === option}
                    onChange={() => setPaymentStatus(option)}
                  />
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </label>
              ))}
            </div>

            <div className="summary">
              <p>
                <strong>Paid:</strong> GHS {paid.toFixed(2)}
              </p>
              <p>
                <strong>Remaining:</strong> GHS {remaining.toFixed(2)}
              </p>
            </div>

            {/* Actions */}
            <div className="invoice-actions">
              <button
                className="btn-primary"
                onClick={createInvoice}
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Invoice"}
              </button>
              <button
                className="btn-secondary"
                onClick={downloadInvoice}
                disabled={!createdInvoiceId}
              >
                Download PDF
              </button>
              <button
                className="btn-secondary"
                onClick={sendInvoiceEmail}
                disabled={!createdInvoiceId}
              >
                Send Email
              </button>
            </div>

            {message && <p className="status-text">{message}</p>}

            {pdfPreviewUrl && (
              <div className="pdf-preview">
                <h4>Invoice Preview:</h4>
                <iframe
                  src={pdfPreviewUrl}
                  title="Invoice Preview"
                  width="100%"
                  height="500px"
                  frameBorder="0"
                />
              </div>
            )}
          </>
        ) : (
          <h2 className="empty-state">
            Select a booking from the right panel →
          </h2>
        )}
      </motion.main>
    </div>
  );
};

export default InvoiceGeneration;
