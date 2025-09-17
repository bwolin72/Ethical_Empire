/**
 * High-level service wrapper
 * Adds small helpers: e.g. automatic download of PDF to disk,
 * or converting the blob to a URL for preview.
 */
import invoicesAPI from "../invoicesAPI";

/**
 * Create an invoice for a booking
 */
export async function createBookingInvoice(bookingId, paymentStatus = "none") {
  const { data } = await invoicesAPI.createInvoice({
    booking_id: bookingId,
    payment_status: paymentStatus,
  });
  return data;
}

/**
 * Fetch a single invoice by id
 */
export async function fetchInvoice(id) {
  const { data } = await invoicesAPI.getInvoice(id);
  return data;
}

/**
 * Fetch list of invoices (admin)
 */
export async function fetchInvoices(params) {
  const { data } = await invoicesAPI.listInvoices(params);
  return data;
}

/**
 * Update invoice fields (e.g. mark as paid)
 */
export async function editInvoice(id, payload) {
  const { data } = await invoicesAPI.updateInvoice(id, payload);
  return data;
}

/**
 * Delete an invoice
 */
export async function removeInvoice(id) {
  await invoicesAPI.deleteInvoice(id);
  return true;
}

/**
 * Trigger email sending for invoice
 */
export async function emailInvoice(id) {
  const { data } = await invoicesAPI.sendInvoiceEmail(id);
  return data;
}

/**
 * Download the PDF and either
 *  - prompt download
 *  - or return an object URL for preview
 */
export async function downloadInvoicePdf(id, { autoDownload = true } = {}) {
  const { data } = await invoicesAPI.downloadInvoicePdf(id);

  if (autoDownload) {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `invoice_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return true;
  }

  // return Blob URL for preview in <iframe> or PDF viewer
  return window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
}

export default {
  createBookingInvoice,
  fetchInvoice,
  fetchInvoices,
  editInvoice,
  removeInvoice,
  emailInvoice,
  downloadInvoicePdf,
};
