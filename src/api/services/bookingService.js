// src/api/services/bookingService.js
import axiosInstance from "../axiosInstance";
import bookingAPI from "../bookingAPI";

// 🔹 Helper: extract CSRF token from cookie (if available)
const getCSRFToken = () => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    ?.split("=")[1];
};

// 🔹 Helper: attach CSRF + JSON headers
const withCSRF = (config = {}) => {
  const csrfToken = getCSRFToken();
  return {
    ...config,
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}), // only add if exists
      ...(config.headers || {}),
    },
    withCredentials: true,
  };
};

// 🔹 Helper: normalize method so "update" → "patch"
const resolveMethod = (method = "patch") =>
  method === "update" ? "patch" : method;

const bookingService = {
  // ===== Client-facing (no CSRF required for create/list) =====
  create: (data) =>
    axiosInstance.post(bookingAPI.create, data, {
      withCredentials: true,
    }),

  list: () =>
    axiosInstance.get(bookingAPI.list, {
      withCredentials: true,
    }),

  // ===== User (requires auth/CSRF) =====
  userBookings: () => axiosInstance.get(bookingAPI.userBookings, withCSRF()),
  userBookingHistory: () =>
    axiosInstance.get(bookingAPI.userBookingHistory, withCSRF()),
  detail: (id) => axiosInstance.get(bookingAPI.detail(id), withCSRF()),

  // 🔹 Dynamic update (user booking)
  update: (id, data, method = "patch") =>
    axiosInstance[resolveMethod(method)](
      bookingAPI.detail(id),
      data,
      withCSRF()
    ),

  // ===== Admin (requires auth/CSRF) =====
  adminList: () => axiosInstance.get(bookingAPI.adminList, withCSRF()),

  adminUpdate: (id, data, method = "patch") =>
    axiosInstance[resolveMethod(method)](
      bookingAPI.adminUpdate(id),
      data,
      withCSRF()
    ),

  adminUpdateStatus: (id, data, method = "patch") =>
    axiosInstance[resolveMethod(method)](
      bookingAPI.adminUpdateStatus(id),
      data,
      withCSRF()
    ),

  adminDelete: (id) => axiosInstance.delete(bookingAPI.adminDelete(id), withCSRF()),

  // ===== Invoice (requires auth/CSRF) =====
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
