// src/components/admin/InvoiceGeneration.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import bookingService from "../../api/services/bookingService";
import serviceService from "../../api/services/serviceService";
import invoiceService from "../../api/services/invoiceService"; // ✅ new service
import "./InvoiceGeneration.css";

const InvoiceGeneration = () => {
  // ==============================
  // State Management
  // ==============================
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [paymentStatus, setPaymentStatus] = useState("none");
  const [creating, setCreating] = useState(false);
  const [createdInvoiceId, setCreatedInvoiceId] = useState(null);

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ==============================
  // Fetch Bookings & Services
  // ==============================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookingsRes, servicesRes] = await Promise.all([
          bookingService.adminList(),
          serviceService.getServices(),
        ]);

        const bookingsData = Array.isArray(bookingsRes.data)
          ? bookingsRes.data
          : bookingsRes.data?.results || [];

        const servicesData = Array.isArray(servicesRes.data)
          ? servicesRes.data
          : servicesRes.data?.results || [];

        setBookings(bookingsData);
        setServices(servicesData);
      } catch (err) {
        console.error("[InvoiceGeneration] Fetch error:", err);
        setMessage("❌ Failed to load bookings or services.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ==============================
  // Computed Values
  // ==============================
  const booking = bookings.find((b) => b.id === selectedId);

  const serviceList = booking?.services || [];
  const total = serviceList.reduce((sum, id) => {
    const match = services.find((s) => s.id === id || s.name === id);
    return sum + (match ? parseFloat(match.price) : 0);
  }, 0);

  const paid =
    paymentStatus === "full" ? total : paymentStatus === "half" ? total / 2 : 0;
  const remaining = total - paid;

  // ==============================
  // Helpers
  // ==============================
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
  };

  const resetInvoiceState = () => {
    setCreatedInvoiceId(null);
    setPdfPreviewUrl(null);
    setPaymentStatus("none");
    setMessage("");
  };

  // ==============================
  // Invoice Actions
  // ==============================
  const createInvoice = async () => {
    if (!booking || !paymentStatus) return;
    setCreating(true);
    setMessage("");
    setPdfPreviewUrl(null);

    try {
      const res = await invoiceService.create({
        booking_id: booking.id,
        payment_status: paymentStatus,
      });

      setCreatedInvoiceId(res.data.id);
      setMessage("✅ Invoice created successfully.");
      fetchInvoicePDF(res.data.id);
    } catch (error) {
      console.error("[InvoiceGeneration] Create error:", error);
      setMessage("❌ Error creating invoice.");
    } finally {
      setCreating(false);
    }
  };

  const fetchInvoicePDF = async (invoiceId) => {
    try {
      const res = await invoiceService.download(invoiceId);
      const blob = new Blob([res.data], { type: "application/pdf" });
      setPdfPreviewUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error("[InvoiceGeneration] PDF fetch error:", error);
      setMessage("❌ Could not load PDF preview.");
    }
  };

  const downloadInvoice = async () => {
    if (!createdInvoiceId) return;
    try {
      const res = await invoiceService.download(createdInvoiceId);
      const blob = new Blob([res.data], { type: "application/pdf" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `invoice_${booking?.name || "booking"}_${createdInvoiceId}.pdf`;
      link.click();
    } catch (error) {
      console.error("[InvoiceGeneration] Download error:", error);
      setMessage("❌ Failed to download PDF.");
    }
  };

  const sendInvoiceEmail = async () => {
    if (!createdInvoiceId) return;
    try {
      await invoiceService.sendEmail(createdInvoiceId);
      setMessage("📧 Invoice sent via email.");
    } catch (error) {
      console.error("[InvoiceGeneration] Email error:", error);
      setMessage("❌ Failed to send invoice email.");
    }
  };

  // ==============================
  // Render
  // ==============================
  return (
    <div className="invoice-container">
      {/* MAIN CONTENT */}
      <motion.main
        className="invoice-main"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {loading ? (
          <p>Loading bookings...</p>
        ) : booking ? (
          <>
            <h3>{booking.name}</h3>
            <p><strong>Booking Date:</strong> {formatDate(booking.created_at)}</p>
            <p><strong>Event Date:</strong> {formatDate(booking.event_date)}</p>
            <p><strong>Phone:</strong> {booking.phone}</p>
            <p><strong>Venue:</strong> {booking.address || "N/A"}</p>
            <p><strong>Services:</strong> {serviceList.join(", ") || "N/A"}</p>
            <p><strong>Total:</strong> GHS {total.toFixed(2)}</p>

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

            <p><strong>Paid:</strong> GHS {paid.toFixed(2)}</p>
            <p><strong>Remaining:</strong> GHS {remaining.toFixed(2)}</p>

            {/* Action Buttons */}
            <div className="invoice-actions">
              <button onClick={createInvoice} disabled={creating}>
                {creating ? "Creating..." : "Create Invoice"}
              </button>
              <button onClick={downloadInvoice} disabled={!createdInvoiceId}>
                Download PDF
              </button>
              <button onClick={sendInvoiceEmail} disabled={!createdInvoiceId}>
                Send Invoice Email
              </button>
            </div>

            {/* Messages */}
            {message && <p className="message">{message}</p>}

            {/* PDF Preview */}
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
          <h2 className="empty-state">Select a booking from the right panel →</h2>
        )}
      </motion.main>

      {/* SIDEBAR */}
      <motion.aside
        className="invoice-sidebar"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Bookings</h2>
        {bookings.map((b) => (
          <div
            key={b.id}
            onClick={() => {
              setSelectedId(b.id);
              resetInvoiceState();
            }}
            className={`invoice-item ${b.id === selectedId ? "active" : ""}`}
          >
            {b.name} – {formatDate(b.event_date)}
          </div>
        ))}
      </motion.aside>
    </div>
  );
};

export default InvoiceGeneration;
