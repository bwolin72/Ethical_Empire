import axiosInstance from '../axiosInstance';
import API from '../api';

const invoiceService = {
  createInvoice: (data) => axiosInstance.post(API.invoices.create, data),
  getInvoices: () => axiosInstance.get(API.invoices.list),
  getInvoiceDetail: (id) => axiosInstance.get(API.invoices.detail(id)),
  updateInvoice: (id, data) => axiosInstance.patch(API.invoices.update(id), data),
  deleteInvoice: (id) => axiosInstance.delete(API.invoices.delete(id)),

  generatePdf: (id) => axiosInstance.get(API.invoices.generatePdf(id), { responseType: 'blob' }),
  sendInvoiceEmail: (id) => axiosInstance.post(API.invoices.sendEmail(id)),
};

export default invoiceService;
