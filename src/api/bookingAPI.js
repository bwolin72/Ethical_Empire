// src/api/bookingAPI.js
import baseURL from "./baseURL";

const bookingAPI = {
  // ===== Public =====
  create: `${baseURL}/bookings/submit/`,             // POST
  list: `${baseURL}/bookings/`,                      // GET

  // ===== User =====
  userBookings: `${baseURL}/bookings/user/`,         // GET
  userBookingHistory: `${baseURL}/bookings/user/history/`, // GET
  detail: (id) => `${baseURL}/bookings/${id}/`,      // GET, PATCH, DELETE

  // ===== Admin =====
  adminList: `${baseURL}/bookings/admin/bookings/`,                      // GET
  adminUpdate: (id) => `${baseURL}/bookings/admin/bookings/${id}/update/`, // PATCH
  adminUpdateStatus: (id) => `${baseURL}/bookings/admin/bookings/${id}/status/`, // PATCH
  adminDelete: (id) => `${baseURL}/bookings/admin/bookings/${id}/delete/`,       // DELETE

  // ===== Invoice =====
  invoice: (id) => `${baseURL}/bookings/invoice/${id}/`,      // GET
  invoiceEmail: (id) => `${baseURL}/invoices/${id}/send_email/`,
  invoiceDownload: (id) => `${baseURL}/invoices/${id}/download_pdf/`,
};

export default bookingAPI;
