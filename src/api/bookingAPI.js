// src/api/services/bookingService.js
import axiosInstance from '../axiosInstance';
import bookingAPI from '../bookingAPI';

const getCSRFToken = () => {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrftoken='))
    ?.split('=')[1];
};

const withCSRF = (config = {}) => {
  const csrfToken = getCSRFToken();
  return {
    ...config,
    headers: {
      'X-CSRFToken': csrfToken,
      'Content-Type': 'application/json',
      ...(config.headers || {}),
    },
    withCredentials: true,
  };
};

const bookingService = {
  // ===== Client-facing =====
  create: (data) => axiosInstance.post(bookingAPI.create, data, withCSRF()),
  list: () => axiosInstance.get(bookingAPI.list, withCSRF()),
  userBookings: () => axiosInstance.get(bookingAPI.userBookings, withCSRF()),
  userBookingHistory: () => axiosInstance.get(bookingAPI.userBookingHistory, withCSRF()),
  detail: (id) => axiosInstance.get(bookingAPI.detail(id), withCSRF()),

  // ===== Admin =====
  adminList: () => axiosInstance.get(bookingAPI.adminList, withCSRF()),
  adminDetail: (id) => axiosInstance.get(bookingAPI.adminDetail(id), withCSRF()),
  adminUpdate: (id, data) => axiosInstance.patch(bookingAPI.adminUpdate(id), data, withCSRF()),
  adminUpdateStatus: (id, data) =>
    axiosInstance.patch(bookingAPI.adminUpdateStatus(id), data, withCSRF()),
  adminDelete: (id) => axiosInstance.delete(bookingAPI.adminDelete(id), withCSRF()),

  // ===== Invoice =====
  invoice: (id) => axiosInstance.get(bookingAPI.invoice(id), withCSRF()),
  invoiceDownload: (id) =>
    axiosInstance.get(bookingAPI.invoice(id), {
      responseType: 'blob',
      ...withCSRF(),
    }),
  invoiceEmail: (id, data = {}) =>
    axiosInstance.post(bookingAPI.invoiceEmail(id), data, withCSRF()), // ✅ New
};

export default bookingService;
