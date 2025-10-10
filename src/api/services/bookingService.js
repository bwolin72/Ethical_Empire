import axiosInstance from "../axiosInstance";
import bookingAPI from "../bookingAPI";

// ===============================
// CSRF Utilities
// ===============================
const getCSRFToken = () =>
  document.cookie.split("; ").find((row) => row.startsWith("csrftoken="))?.split("=")[1];

const withCSRF = (config = {}) => {
  const csrfToken = getCSRFToken();
  return {
    ...config,
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
      ...(config.headers || {}),
    },
    withCredentials: true,
  };
};

// ===============================
// Normalize HTTP method
// ===============================
const resolveMethod = (method = "patch") =>
  ["patch", "put"].includes(method.toLowerCase()) ? method.toLowerCase() : "patch";

// ===============================
// Booking Service
// ===============================
const bookingService = {
  // ===== Public =====
  create: (data) => axiosInstance.post(bookingAPI.create, data, withCSRF()),
  list: () => axiosInstance.get(bookingAPI.list, withCSRF()),

  // ===== User =====
  userBookings: () => axiosInstance.get(bookingAPI.userBookings, withCSRF()),
  userBookingHistory: () => axiosInstance.get(bookingAPI.userBookingHistory, withCSRF()),
  detail: (id) => axiosInstance.get(bookingAPI.detail(id), withCSRF()),
  update: (id, data, method = "patch") =>
    axiosInstance[resolveMethod(method)](bookingAPI.detail(id), data, withCSRF()),
  delete: (id) => axiosInstance.delete(bookingAPI.detail(id), withCSRF()),

  // ===== Admin =====
  adminList: () => axiosInstance.get(bookingAPI.adminList, withCSRF()),
  updateAdmin: (id, data, method = "patch") =>
    axiosInstance[resolveMethod(method)](bookingAPI.adminUpdate(id), data, withCSRF()),
  updateStatus: (id, data, method = "patch") =>
    axiosInstance[resolveMethod(method)](bookingAPI.adminUpdateStatus(id), data, withCSRF()),
  deleteAdmin: (id) => axiosInstance.delete(bookingAPI.adminDelete(id), withCSRF()),

  // ===== Invoices =====
  invoice: (id) => axiosInstance.get(bookingAPI.invoice(id), withCSRF()),
  invoiceDownload: (id) =>
    axiosInstance.get(bookingAPI.invoiceDownload(id), {
      ...withCSRF(),
      responseType: "blob",
    }),
  invoiceEmail: (id, data = {}) =>
    axiosInstance.post(bookingAPI.invoiceEmail(id), data, withCSRF()),
};

export default bookingService;
