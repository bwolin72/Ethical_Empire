/**
 * High-level Invoice Service Wrapper
 * ----------------------------------
 * Provides user-facing helpers built on top of invoicesAPI.
 * Adds error handling, automatic fallback for existing invoices,
 * and convenience helpers (download/email).
 */

import invoicesAPI from "../invoicesAPI";

/** Create or fetch an invoice for a booking */
export async function createBookingInvoice(bookingId, paymentStatus = "none") {
  try {
    const { data } = await invoicesAPI.createInvoice({
      booking_id: bookingId,
      payment_status: paymentStatus,
    });
    return data;
  } catch (err) {
    // Handle already-existing invoice gracefully
    if (err.response?.status === 400) {
      const message = err.response.data?.error;
      if (message?.includes("already exists")) {
        const existing = await fetchInvoiceByBooking(bookingId);
        return existing;
      }
    }
    throw err;
  }
}

/** Fetch a single invoice by ID */
export async function fetchInvoice(id) {
  const { data } = await invoicesAPI.getInvoice(id);
  return data;
}

/** Fetch all invoices or filtered set (admin) */
export async function fetchInvoices(params) {
  const { data } = await invoicesAPI.listInvoices(params);
  return data;
}

/** Fetch invoice by booking (helper for create fallback) */
export async function fetchInvoiceByBooking(bookingId) {
  const { data } = await invoicesAPI.listInvoices({ booking: bookingId });
  return Array.isArray(data?.results) ? data.results[0] : data[0] || data;
}

/** Edit invoice fields (PATCH) */
export async function editInvoice(id, payload) {
  const { data } = await invoicesAPI.updateInvoice(id, payload);
  return data;
}

/** Delete an invoice */
export async function removeInvoice(id) {
  await invoicesAPI.deleteInvoice(id);
  return true;
}

/** Send invoice email */
export async function emailInvoice(id) {
  const { data } = await invoicesAPI.sendInvoiceEmail(id);
  return data;
}

/**
 * Download invoice PDF — either auto-download or return a blob URL.
 */
export async function downloadInvoicePdf(id, { autoDownload = true } = {}) {
  try {
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

    return url; // For preview
  } catch (err) {
    console.error("Failed to download invoice PDF:", err);
    throw err;
  }
}

export default {
  createBookingInvoice,
  fetchInvoice,
  fetchInvoices,
  fetchInvoiceByBooking,
  editInvoice,
  removeInvoice,
  emailInvoice,
  downloadInvoicePdf,
};
