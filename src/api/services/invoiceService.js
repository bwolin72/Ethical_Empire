import axiosInstance from '../axiosInstance';
import API from '../invoicesAPI'; // should expose: list, create, detail(id), update(id), delete(id), downloadPdf(id), sendEmail(id)

const invoiceService = {
  createInvoice: (data) => axiosInstance.post(API.create, data),
  getInvoices: () => axiosInstance.get(API.list),
  getInvoiceDetail: (id) => axiosInstance.get(API.detail(id)),
  updateInvoice: (id, data) => axiosInstance.patch(API.update(id), data),
  deleteInvoice: (id) => axiosInstance.delete(API.delete(id)),

  downloadPdf: (id) => axiosInstance.get(API.downloadPdf(id), { responseType: 'blob' }),
  sendInvoiceEmail: (id) => axiosInstance.post(API.sendEmail(id)),

  // 🔁 Dashboard compatibility alias
  list: () => axiosInstance.get(API.list),
};

export default invoiceService;
