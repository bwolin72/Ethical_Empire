// src/pdfjs-setup.js
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";
import brochure from "./assets/files/brochure.pdf";

// Set worker path once (before calling getDocument)
GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

// Export a function to load PDF
export const loadPDF = async () => {
  try {
    const loadingTask = getDocument({ url: brochure });
    const pdf = await loadingTask.promise;
    console.log("PDF loaded:", pdf);
    return pdf;
  } catch (err) {
    console.error("Error loading PDF:", err);
    throw err;
  }
};
