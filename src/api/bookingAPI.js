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
  adminDetail: (id) => `${baseURL}/bookings-admin/bookings/${id}/update/`,
  adminUpdate: (id) => `${baseURL}/bookings-admin/bookings/${id}/update/`,
  adminUpdateStatus: (id) => `${baseURL}/bookings-admin/bookings/${id}/status/`,
  adminDelete: (id) => `${baseURL}/bookings-admin/bookings/${id}/delete/`,

  // ===== Invoice =====
  invoice: (id) => `${baseURL}/invoice/${id}/`,
};

export default bookingAPI;
