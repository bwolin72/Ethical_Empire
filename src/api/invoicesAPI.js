import baseURL from './baseURL';

const invoicesAPI = {
  list: `${baseURL}/api/invoices/invoices/`,                    // GET, POST
  create: `${baseURL}/api/invoices/invoices/`,                  // POST
  detail: (id) => `${baseURL}/api/invoices/invoices/${id}/`,    // GET, PATCH, DELETE
  update: (id) => `${baseURL}/api/invoices/invoices/${id}/`,    // PATCH
  delete: (id) => `${baseURL}/api/invoices/invoices/${id}/`,    // DELETE
  downloadPdf: (id) => `${baseURL}/api/invoices/invoices/${id}/download_pdf/`, 
  sendEmail: (id) => `${baseURL}/api/invoices/invoices/${id}/send_email/`,
};

export default invoicesAPI;
