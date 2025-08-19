// src/api/services/bookingService.js
import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import bookingAPI from '../bookingAPI';

const bookingService = {
  // Client-facing
  create: (data) => publicAxios.post(bookingAPI.create, data),
  list: () => axiosInstance.get(bookingAPI.list),
  userBookings: () => axiosInstance.get(bookingAPI.userBookings),
  userBookingHistory: () => axiosInstance.get(bookingAPI.userBookingHistory),
  detail: (id) => axiosInstance.get(bookingAPI.detail(id)),
  update: (id, data) => axiosInstance.patch(bookingAPI.detail(id), data),
  delete: (id) => axiosInstance.delete(bookingAPI.detail(id)),

  // Admin
  adminList: () => axiosInstance.get(bookingAPI.adminList),
  adminDetail: (id) => axiosInstance.get(bookingAPI.adminDetail(id)),
  adminUpdateStatus: (id, data) =>
    axiosInstance.post(bookingAPI.adminUpdateStatus(id), data),

  // Invoice
  invoice: (id) => axiosInstance.get(bookingAPI.invoice(id)),
};

export default bookingService;
