import baseURL from './baseURL';

const invoicesAPI = {
  list: `${baseURL}/invoices/invoices/`,
  detail: (id) => `${baseURL}/invoices/invoices/${id}/`,
  downloadPdf: (id) => `${baseURL}/invoices/invoices/${id}/download_pdf/`,
  sendEmail: (id) => `${baseURL}/invoices/invoices/${id}/send_email/`,
};

export default invoicesAPI;
