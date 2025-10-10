/**
 * Low-level Invoice API
 * ---------------------
 * Maps 1:1 to Django REST InvoiceViewSet endpoints.
 */
import privateAxios from "./axiosInstance";

const BASE_PATH = "/invoices/invoices/";

/** Create a new invoice for a booking */
export function createInvoice(data) {
  // data: { booking_id: number, payment_status?: "none"|"half"|"full" }
  return privateAxios.post(BASE_PATH, data);
}

/** Retrieve a single invoice */
export function getInvoice(id) {
  return privateAxios.get(`${BASE_PATH}${id}/`);
}

/** List invoices (admin or filtered) */
export function listInvoices(params) {
  return privateAxios.get(BASE_PATH, { params });
}

/** Update an invoice (PATCH) */
export function updateInvoice(id, payload) {
  return privateAxios.patch(`${BASE_PATH}${id}/`, payload);
}

/** Delete an invoice */
export function deleteInvoice(id) {
  return privateAxios.delete(`${BASE_PATH}${id}/`);
}

/** Download PDF blob for an invoice */
export function downloadInvoicePdf(id) {
  return privateAxios.get(`${BASE_PATH}${id}/download_pdf/`, {
    responseType: "blob",
  });
}

/** Trigger email send for an invoice */
export function sendInvoiceEmail(id) {
  return privateAxios.post(`${BASE_PATH}${id}/send_email/`);
}

export default {
  createInvoice,
  getInvoice,
  listInvoices,
  updateInvoice,
  deleteInvoice,
  downloadInvoicePdf,
  sendInvoiceEmail,
};
