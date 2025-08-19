// src/api/bookingAPI.js
import baseURL from './baseURL';

const bookingAPI = {
  create: `${baseURL}/bookings/submit/`,
  list: `${baseURL}/bookings/`,
  userBookings: `${baseURL}/bookings/user/`,
  userBookingHistory: `${baseURL}/bookings/user/history/`,
  detail: (id) => `${baseURL}/bookings/${id}/`,
  adminList: `${baseURL}/bookings/admin/bookings/`,
  adminDetail: (id) => `${baseURL}/bookings/admin/bookings/${id}/`,
  adminUpdateStatus: (id) => `${baseURL}/bookings/admin/bookings/${id}/status/`,
  invoice: (id) => `${baseURL}/bookings/invoice/${id}/`,
};

export default bookingAPI;
