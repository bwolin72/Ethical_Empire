/**
 * Low-level API calls for Django Invoice endpoints
 * -------------------------------------------------
 * Uses privateAxios for authenticated requests.
 * Backend router is nested → /api/invoices/invoices/
 */

import privateAxios from "./axiosInstance";

// ---------------------------------------------------------------------
// Base path — because backend route is nested (api/invoices/invoices/)
// ---------------------------------------------------------------------
const BASE_PATH = "/invoices/invoices/";

// ---------------------------------------------------------------------
// CRUD endpoints
// ---------------------------------------------------------------------

/**
 * Create a new invoice for a given booking
 * @param {{ booking_id: number, payment_status?: "none"|"half"|"full" }} data
 */
export function createInvoice(data) {
  return privateAxios.post(BASE_PATH, data);
}

/**
 * Retrieve a single invoice by ID
 * @param {number|string} id
 */
export function getInvoice(id) {
  return privateAxios.get(`${BASE_PATH}${id}/`);
}

/**
 * List all invoices (admin or filtered)
 * @param {object} [params]
 */
export function listInvoices(params) {
  return privateAxios.get(BASE_PATH, { params });
}

/**
 * Update invoice fields (PATCH)
 * @param {number|string} id
 * @param {object} payload
 */
export function updateInvoice(id, payload) {
  return privateAxios.patch(`${BASE_PATH}${id}/`, payload);
}

/**
 * Delete an invoice
 * @param {number|string} id
 */
export function deleteInvoice(id) {
  return privateAxios.delete(`${BASE_PATH}${id}/`);
}

// ---------------------------------------------------------------------
// Custom actions (@action endpoints in Django ViewSet)
// ---------------------------------------------------------------------

/**
 * Download generated PDF for an invoice
 * @param {number|string} id
 */
export function downloadInvoicePdf(id) {
  return privateAxios.get(`${BASE_PATH}${id}/download_pdf/`, {
    responseType: "blob",
  });
}

/**
 * Trigger email sending for an invoice
 * @param {number|string} id
 */
export function sendInvoiceEmail(id) {
  return privateAxios.post(`${BASE_PATH}${id}/send_email/`);
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
