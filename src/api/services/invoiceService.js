/**
 * High-level Invoice Service Wrapper
 * ----------------------------------
 * Provides user-facing helpers built on top of invoicesAPI.
 * Handles common patterns like PDF downloads or Blob-to-URL conversion.
 */

import invoicesAPI from "../invoicesAPI";

/**
 * Create an invoice for a booking.
 * @param {number} bookingId
 * @param {"none"|"half"|"full"} [paymentStatus="none"]
 */
export async function createBookingInvoice(bookingId, paymentStatus = "none") {
  const { data } = await invoicesAPI.createInvoice({
    booking_id: bookingId,
    payment_status: paymentStatus,
  });
  return data;
}

/**
 * Fetch a single invoice by ID.
 * @param {number|string} id
 */
export async function fetchInvoice(id) {
  const { data } = await invoicesAPI.getInvoice(id);
  return data;
}

/**
 * Fetch a list of invoices (admin or filtered).
 * @param {object} [params]
 */
export async function fetchInvoices(params) {
  const { data } = await invoicesAPI.listInvoices(params);
  return data;
}

/**
 * Edit or update invoice fields (PATCH).
 * @param {number|string} id
 * @param {object} payload
 */
export async function editInvoice(id, payload) {
  const { data } = await invoicesAPI.updateInvoice(id, payload);
  return data;
}

/**
 * Delete an invoice.
 * @param {number|string} id
 */
export async function removeInvoice(id) {
  await invoicesAPI.deleteInvoice(id);
  return true;
}

/**
 * Trigger sending of an invoice email.
 * @param {number|string} id
 */
export async function emailInvoice(id) {
  const { data } = await invoicesAPI.sendInvoiceEmail(id);
  return data;
}

/**
 * Download invoice PDF — either auto-download or return preview URL.
 * @param {number|string} id
 * @param {{ autoDownload?: boolean }} [options]
 */
export async function downloadInvoicePdf(id, { autoDownload = true } = {}) {
  const { data } = await invoicesAPI.downloadInvoicePdf(id);
  const blob = new Blob([data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);

  if (autoDownload) {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `invoice_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return true;
  }

  // Return previewable blob URL for <iframe> or PDF viewer
  return url;
}

// ---------------------------------------------------------------------

export default {
  createBookingInvoice,
  fetchInvoice,
  fetchInvoices,
  editInvoice,
  removeInvoice,
  emailInvoice,
  downloadInvoicePdf,
};
