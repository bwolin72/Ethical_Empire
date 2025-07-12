import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';
import './InvoiceGeneration.css';

const InvoiceGeneration = () => {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('none');
  const [creating, setCreating] = useState(false);
  const [createdInvoiceId, setCreatedInvoiceId] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookingsRes, servicesRes] = await Promise.all([
          axiosInstance.get('/bookings/'),
          axiosInstance.get('/services/')  // ✅ fixed endpoint
        ]);
        setBookings(bookingsRes.data);
        setServices(servicesRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setMessage('❌ Failed to load bookings or services.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const booking = bookings.find(b => b.id === selectedId);
  const serviceList = Array.isArray(booking?.service_type)
    ? booking.service_type
    : booking?.service_type
    ? [booking.service_type]
    : [];

  const total = serviceList.reduce((sum, s) => {
    const match = services.find(item => item.name === s);
    return sum + (match ? parseFloat(match.price) : 0);
  }, 0);

  const paid = paymentStatus === 'full' ? total : paymentStatus === 'half' ? total / 2 : 0;
  const remaining = total - paid;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  };

  const createInvoice = async () => {
    if (!booking || !paymentStatus) return;
    setCreating(true);
    setMessage('');
    setPdfPreviewUrl(null);

    try {
      const res = await axiosInstance.post('/invoices/', {
        booking_id: booking.id,
        payment_status: paymentStatus
      });
      setCreatedInvoiceId(res.data.id);
      setMessage('✅ Invoice created successfully.');
      fetchInvoicePDF(res.data.id);
    } catch (error) {
      console.error(error);
      setMessage('❌ Error creating invoice.');
    } finally {
      setCreating(false);
    }
  };

  const fetchInvoicePDF = async (invoiceId) => {
    try {
      const res = await axiosInstance.get(`/invoices/${invoiceId}/download_pdf/`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
    } catch (error) {
      console.error('Failed to fetch PDF:', error);
      setMessage('❌ Could not load PDF preview.');
    }
  };

  const downloadInvoice = async () => {
    if (!createdInvoiceId) return;
    try {
      const res = await axiosInstance.get(`/invoices/${createdInvoiceId}/download_pdf/`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `invoice_${booking.name}_${createdInvoiceId}.pdf`;
      link.click();
    } catch (error) {
      console.error('Error downloading invoice:', error);
      setMessage('❌ Failed to download PDF.');
    }
  };

  const sendInvoiceEmail = async () => {
    if (!createdInvoiceId) return;
    try {
      await axiosInstance.post(`/invoices/${createdInvoiceId}/send_email/`);
      setMessage('📧 Invoice sent via email.');
    } catch (error) {
      console.error('Error sending invoice email:', error);
      setMessage('❌ Failed to send invoice email.');
    }
  };

  const resetInvoiceState = () => {
    setCreatedInvoiceId(null);
    setPdfPreviewUrl(null);
    setPaymentStatus('none');
    setMessage('');
  };

  return (
    <div className="invoice-container">
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
            <p><strong>Venue:</strong> {booking.address || 'N/A'}</p>
            <p><strong>Service Type:</strong> {serviceList.join(', ') || 'N/A'}</p>
            <p><strong>Total:</strong> GHS {total.toFixed(2)}</p>

            <div className="payment-options">
              {['none', 'half', 'full'].map(option => (
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

            <div className="invoice-actions">
              <button onClick={createInvoice} disabled={creating}>
                {creating ? 'Creating...' : 'Create Invoice'}
              </button>

              <button onClick={downloadInvoice} disabled={!createdInvoiceId}>
                Download PDF
              </button>

              <button onClick={sendInvoiceEmail} disabled={!createdInvoiceId}>
                Send Invoice Email
              </button>
            </div>

            {message && <p className="message">{message}</p>}

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

      <motion.aside
        className="invoice-sidebar"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Bookings</h2>
        {bookings.map(b => (
          <div
            key={b.id}
            onClick={() => {
              setSelectedId(b.id);
              resetInvoiceState();
            }}
            className={`invoice-item ${b.id === selectedId ? 'active' : ''}`}
          >
            {b.name} – {formatDate(b.event_date)}
          </div>
        ))}
      </motion.aside>
    </div>
  );
};

export default InvoiceGeneration;
