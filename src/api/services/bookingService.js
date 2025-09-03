const bookingService = {
  // Public
  create: (data) => axiosInstance.post(bookingAPI.create, data),
  list: () => axiosInstance.get(bookingAPI.list),

  // User
  userBookings: () => axiosInstance.get(bookingAPI.userBookings),
  userBookingHistory: () => axiosInstance.get(bookingAPI.userBookingHistory),
  detail: (id) => axiosInstance.get(bookingAPI.detail(id)),

  // Admin
  adminList: () => axiosInstance.get(bookingAPI.adminList),
  adminUpdate: (id, data) => axiosInstance.patch(bookingAPI.adminUpdate(id), data),
  adminUpdateStatus: (id, data) => axiosInstance.patch(bookingAPI.adminUpdateStatus(id), data),
  adminDelete: (id) => axiosInstance.delete(bookingAPI.adminDelete(id)),

  // Invoice
  invoice: (id) => axiosInstance.get(bookingAPI.invoice(id)),
  invoiceDownload: (id) =>
    axiosInstance.get(bookingAPI.invoiceDownload(id), { responseType: "blob" }),
  invoiceEmail: (id, data = {}) =>
    axiosInstance.post(bookingAPI.invoiceEmail(id), data),
};
