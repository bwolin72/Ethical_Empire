import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import API from '../api';

const bookingService = {
  createBooking: (data) => publicAxios.post(API.bookings.create, data),
  getUserBookings: () => axiosInstance.get(API.bookings.userBookings),
  getAdminBookings: () => axiosInstance.get(API.bookings.adminBookings),
  getBookingDetail: (id) => axiosInstance.get(API.bookings.detail(id)),
  updateBooking: (id, data) => axiosInstance.patch(API.bookings.update(id), data),
  deleteBooking: (id) => axiosInstance.delete(API.bookings.delete(id)),

  sendConfirmationEmail: (id) => axiosInstance.post(API.bookings.sendConfirmation(id)),
  sendAdminNotification: (id) => axiosInstance.post(API.bookings.sendAdminNotification(id)),

  updateStatus: (id, status) =>
    axiosInstance.patch(API.bookings.updateStatus(id), { status }),
};

export default bookingService;
