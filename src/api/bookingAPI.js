// src/api/bookingAPI.js
import baseURL from './baseURL';

const bookingAPI = {
  // ===== Client =====
  create: `${baseURL}/submit/`,
  list: `${baseURL}/`,

  userBookings: `${baseURL}/user/`,
  userBookingHistory: `${baseURL}/user/history/`,
  detail: (id) => `${baseURL}/${id}/`,

  // ===== Admin =====
  adminList: `${baseURL}/bookings-admin/bookings/`,
  adminDetail: (id) => `${baseURL}/bookings-admin/bookings/${id}/update/`, // GET for details
  adminUpdate: (id) => `${baseURL}/bookings-admin/bookings/${id}/update/`, // PATCH for updates
  adminUpdateStatus: (id) => `${baseURL}/bookings-admin/bookings/${id}/status/`, // PATCH for status updates
  adminDelete: (id) => `${baseURL}/bookings-admin/bookings/${id}/delete/`, // DELETE

  // ===== Invoice =====
  invoice: (id) => `${baseURL}/invoice/${id}/`,
  invoiceEmail: (id) => `${baseURL}/invoice/${id}/send-email/`, // ✅ New
};

export default bookingAPI;
