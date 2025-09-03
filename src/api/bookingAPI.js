import baseURL from './baseURL';

const bookingAPI = {
  // ===== Client =====
  create: `${baseURL}/api/bookings/submit/`,             // POST
  list: `${baseURL}/api/bookings/`,                      // GET

  // ===== User =====
  userBookings: `${baseURL}/api/bookings/user/`,         // GET
  detail: (id) => `${baseURL}/api/bookings/${id}/`,      // GET, PATCH, DELETE

  // ===== Admin =====
  adminList: `${baseURL}/api/bookings/admin/bookings/`,           // GET
  adminUpdateStatus: (id) => `${baseURL}/api/bookings/admin/bookings/${id}/status/`, // PATCH
  adminDelete: (id) => `${baseURL}/api/bookings/admin/bookings/${id}/delete/`,       // DELETE

  // ===== Invoice =====
  invoice: (id) => `${baseURL}/api/bookings/invoice/${id}/`,      // GET invoice for booking

  // Forward to invoices app
  invoiceEmail: (id) => `${baseURL}/api/invoices/invoices/${id}/send_email/`,
  invoiceDownload: (id) => `${baseURL}/api/invoices/invoices/${id}/download_pdf/`,
};

export default bookingAPI;
