// src/api/bookingAPI.js
import baseURL from './baseURL';
import axiosInstance from './axiosInstance';

const bookingAPI = {
  endpoints: {
    create: `${baseURL}/bookings/submit/`,
    list: `${baseURL}/bookings/`,
    userBookings: `${baseURL}/bookings/user/`,
    userBookingHistory: `${baseURL}/bookings/user/history/`,
    userBookingDetail: (id) => `${baseURL}/bookings/${id}/`,
    adminList: `${baseURL}/bookings/admin/bookings/`,
    adminDetail: (id) => `${baseURL}/bookings/admin/bookings/${id}/`,
    adminUpdate: (id) => `${baseURL}/bookings/admin/bookings/${id}/update/`,
    adminUpdateStatus: (id) => `${baseURL}/bookings/admin/bookings/${id}/status/`,
    adminDelete: (id) => `${baseURL}/bookings/admin/bookings/${id}/delete/`,
    invoice: (id) => `${baseURL}/bookings/invoice/${id}/`,
  },

  // ===== METHODS =====
  create: (data) => axiosInstance.post(bookingAPI.endpoints.create, data),
  list: () => axiosInstance.get(bookingAPI.endpoints.list),
  userBookings: () => axiosInstance.get(bookingAPI.endpoints.userBookings),
  userBookingHistory: () =>
    axiosInstance.get(bookingAPI.endpoints.userBookingHistory),
  userBookingDetail: (id) =>
    axiosInstance.get(bookingAPI.endpoints.userBookingDetail(id)),
  userBookingUpdate: (id, data) =>
    axiosInstance.patch(bookingAPI.endpoints.userBookingDetail(id), data),
  userBookingDelete: (id) =>
    axiosInstance.delete(bookingAPI.endpoints.userBookingDetail(id)),

  adminList: () => axiosInstance.get(bookingAPI.endpoints.adminList),
  adminDetail: (id) => axiosInstance.get(bookingAPI.endpoints.adminDetail(id)),
  adminUpdate: (id, data) =>
    axiosInstance.patch(bookingAPI.endpoints.adminUpdate(id), data),
  adminUpdateStatus: (id, data) =>
    axiosInstance.post(bookingAPI.endpoints.adminUpdateStatus(id), data),
  adminDelete: (id) => axiosInstance.delete(bookingAPI.endpoints.adminDelete(id)),

  invoice: (id) => axiosInstance.get(bookingAPI.endpoints.invoice(id)),
};

export default bookingAPI;
