import axiosInstance from '../axiosInstance';
import bookingAPI from '../bookingAPI';

// Optional: reuse your existing CSRF helpers if required by your backend
const getCSRFToken = () =>
  document.cookie.split('; ').find((row) => row.startsWith('csrftoken='))?.split('=')[1];

const withCSRF = (config = {}) => {
  const csrfToken = getCSRFToken();
  return {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
      ...(config.headers || {}),
    },
    withCredentials: true,
  };
};

const bookingService = {
  // Public
  create: (data) => axiosInstance.post(bookingAPI.create, data, { withCredentials: true }),
  list: () => axiosInstance.get(bookingAPI.list, { withCredentials: true }),

  // User
  userBookings: () => axiosInstance.get(bookingAPI.userBookings, withCSRF()),
  userBookingHistory: () => axiosInstance.get(bookingAPI.userBookingHistory, withCSRF()),
  detail: (id) => axiosInstance.get(bookingAPI.detail(id), withCSRF()),

  // Admin
  adminList: () => axiosInstance.get(bookingAPI.adminList, withCSRF()),
  adminUpdate: (id, data) => axiosInstance.patch(bookingAPI.adminUpdate(id), data, withCSRF()),
  adminUpdateStatus: (id, data) => axiosInstance.patch(bookingAPI.adminUpdateStatus(id), data, withCSRF()),
  adminDelete: (id) => axiosInstance.delete(bookingAPI.adminDelete(id), withCSRF()),

  // Invoice
  invoice: (id) => axiosInstance.get(bookingAPI.invoice(id), withCSRF()),
  invoiceDownload: (id) => axiosInstance.get(bookingAPI.invoiceDownload(id), { ...withCSRF(), responseType: 'blob' }),
  invoiceEmail: (id, data = {}) => axiosInstance.post(bookingAPI.invoiceEmail(id), data, withCSRF()),
};

export default bookingService;
