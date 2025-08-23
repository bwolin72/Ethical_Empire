// src/api/bookingAPI.js
import baseURL from './baseURL';

const bookingAPI = {
  // ===== Client =====
  create: `${baseURL}/submit/`,
  list: `${baseURL}/`,

  // ===== User =====
  userBookings: `${baseURL}/user/`,
  userBookingHistory: `${baseURL}/user/history/`,
  detail: (id) => `${baseURL}/${id}/`,

  // ===== Admin =====
  adminList: `${baseURL}/bookings-admin/bookings/`,
  adminUpdate: (id) => `${baseURL}/bookings-admin/bookings/${id}/update/`,   // PATCH
  adminUpdateStatus: (id) => `${baseURL}/bookings-admin/bookings/${id}/status/`, // PATCH
  adminDelete: (id) => `${baseURL}/bookings-admin/bookings/${id}/delete/`,   // DELETE

  // ===== Invoice =====
  invoice: (id) => `${baseURL}/invoice/${id}/`,

  // ✅ Correct: email sending is in the invoices app, not bookings
  invoiceEmail: (id) => `/api/invoices/invoices/${id}/send_email/`,
  invoiceDownload: (id) => `/api/invoices/invoices/${id}/download_pdf/`,
};

export default bookingAPI;
