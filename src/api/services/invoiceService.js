import axiosInstance from '../axiosInstance';
import API from '../invoicesAPI';

const invoiceService = {
  createInvoice: (data) => axiosInstance.post(API.create, data),
  getInvoices: () => axiosInstance.get(API.list),
  getInvoiceDetail: (id) => axiosInstance.get(API.detail(id)),
  updateInvoice: (id, data) => axiosInstance.patch(API.update(id), data),
  deleteInvoice: (id) => axiosInstance.delete(API.delete(id)),

  downloadPdf: (id) => axiosInstance.get(API.downloadPdf(id), { responseType: 'blob' }),
  sendInvoiceEmail: (id) => axiosInstance.post(API.sendEmail(id)),
};

export default invoiceService;
