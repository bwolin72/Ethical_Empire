import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './InvoiceGeneration.css';
import logo from '../../assets/logo.png';

const InvoiceGeneration = () => {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('none');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, servicesRes] = await Promise.all([
          axiosInstance.get('/bookings/'),
          axiosInstance.get('/service-prices/')
        ]);
        setBookings(bookingsRes.data);
        setServices(servicesRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  };

  const generatePDF = () => {
    if (!booking) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Watermark
    doc.setTextColor(240, 240, 240);
    doc.setFontSize(60);
    doc.text('EeTH_GH', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });

    // Header
    doc.setTextColor(0, 0, 0);
    doc.addImage(logo, 'PNG', 14, 10, 40, 40);
    doc.setFontSize(18);
    doc.text('Ethical Multimedia GH', 60, 18);
    doc.setFontSize(11);
    doc.text(': +233 55 342 4865', 60, 25);
    doc.text('asaasebandeethm@gmail.com', 60, 30);
    doc.text('www.ethicalempire.com', 60, 35);
    doc.text('Akotsi - Breku, Kasoa, Ghana', 60, 40);
    doc.setFontSize(16);
    doc.text('INVOICE', pageWidth - 50, 20);
    doc.setFontSize(11);
    doc.text(`Invoice #: INV-${booking.id}`, pageWidth - 50, 26);

    const rows = serviceList.map((service, idx) => {
      const unit = services.find(s => s.name === service)?.price || '';
      return [idx + 1, service, unit, 1, unit];
    });

    autoTable(doc, {
      startY: 50,
      head: [['#', 'Service Type', 'Unit Price (GHS)', 'Qty', 'Amount (GHS)']],
      body: rows,
    });

    const summaryStart = doc.lastAutoTable.finalY + 10;
    doc.text(`Total: GHS ${total.toFixed(2)}`, 14, summaryStart);
    doc.text(`Paid: GHS ${paid.toFixed(2)}`, 14, summaryStart + 6);

    const signatureY = summaryStart + 20;
    doc.text('Authorized Signature:', 14, signatureY);
    doc.line(60, signatureY, 140, signatureY);

    doc.save(`invoice_${booking.name}_${booking.id}.pdf`);
  };

  return (
    <div className="invoice-container">
      <motion.main
        className="invoice-main"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {booking ? (
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
            <button className="download-btn" onClick={generatePDF}>Download Invoice</button>
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
            onClick={() => setSelectedId(b.id)}
            className={`invoice-item ${b.id === selectedId ? 'active' : ''}`}
          >
            {b.name} - {formatDate(b.event_date)}
          </div>
        ))}
      </motion.aside>
    </div>
  );
};

export default InvoiceGeneration;
