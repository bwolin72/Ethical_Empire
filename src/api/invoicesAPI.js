import baseURL from './baseURL';

const invoicesAPI = {
  list: `${baseURL}/invoices/invoices/`,                    // GET, POST
  detail: (id) => `${baseURL}/invoices/invoices/${id}/`,    // GET, PATCH, DELETE
  create: `${baseURL}/invoices/invoices/`,                  // POST
  update: (id) => `${baseURL}/invoices/invoices/${id}/`,    // PATCH
  delete: (id) => `${baseURL}/invoices/invoices/${id}/`,    // DELETE
  downloadPdf: (id) => `${baseURL}/invoices/invoices/${id}/download_pdf/`, 
  sendEmail: (id) => `${baseURL}/invoices/invoices/${id}/send_email/`,
};

export default invoicesAPI;
