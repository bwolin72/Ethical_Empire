/**
 * Low-level API calls to Django Invoice endpoints
 * Uses existing axios instances (privateAxios for authenticated requests).
 */
import privateAxios from "./axiosInstance";

// ---------------------------------------------------------------------
// CRUD + custom actions
// ---------------------------------------------------------------------

// Create a new invoice for a given booking
export function createInvoice(data) {
  // data: { booking_id: number, payment_status?: "none"|"half"|"full" }
  return privateAxios.post("/invoices/", data);
}

// Retrieve one invoice
export function getInvoice(id) {
  return privateAxios.get(`/invoices/${id}/`);
}

// List all invoices (admin)
export function listInvoices(params) {
  // params optional for pagination/filtering
  return privateAxios.get("/invoices/", { params });
}

// Update invoice (PATCH)
export function updateInvoice(id, payload) {
  return privateAxios.patch(`/invoices/${id}/`, payload);
}

// Delete invoice
export function deleteInvoice(id) {
  return privateAxios.delete(`/invoices/${id}/`);
}

// ---------------------------------------------------------------------
// Custom endpoints exposed in the ViewSet (@action)
// ---------------------------------------------------------------------

// Download generated PDF (returns a Blob)
export function downloadInvoicePdf(id) {
  return privateAxios.get(`/invoices/${id}/download_pdf/`, {
    responseType: "blob",
  });
}

// Trigger sending of invoice email (background task)
export function sendInvoiceEmail(id) {
  return privateAxios.post(`/invoices/${id}/send_email/`);
}

// ---------------------------------------------------------------------

export default {
  createInvoice,
  getInvoice,
  listInvoices,
  updateInvoice,
  deleteInvoice,
  downloadInvoicePdf,
  sendInvoiceEmail,
};
