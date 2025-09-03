import baseURL from './baseURL';

const bookingAPI = {
  // ===== Client =====
  create: `${baseURL}/bookings/submit/`,             // POST
  list: `${baseURL}/bookings/`,                      // GET

  // ===== User =====
  userBookings: `${baseURL}/bookings/user/`,         // GET
  detail: (id) => `${baseURL}/bookings/${id}/`,      // GET, PATCH, DELETE

  // ===== Admin =====
  adminList: `${baseURL}/bookings/admin/bookings/`,           // GET
  adminUpdateStatus: (id) => `${baseURL}/bookings/admin/bookings/${id}/status/`, // PATCH
  adminDelete: (id) => `${baseURL}/bookings/admin/bookings/${id}/delete/`,       // DELETE

  // ===== Invoice =====
  invoice: (id) => `${baseURL}/bookings/invoice/${id}/`,      // GET invoice for booking

  // Forward to invoices app
  invoiceEmail: (id) => `${baseURL}/invoices/${id}/send_email/`,
  invoiceDownload: (id) => `${baseURL}/invoices/${id}/download_pdf/`,
};

export default bookingAPI;
