// src/pdfjs-setup.js
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";
import brochure from "../../assets/files/brochure.pdf";

// Set the worker using pdfjs-dist path
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${require("pdfjs-dist/package.json").version}/pdf.worker.min.js`;

// Load the PDF
export const loadingTask = getDocument({ url: brochure });

loadingTask.promise
  .then((pdf) => {
    console.log("PDF loaded successfully:", pdf);
  })
  .catch((err) => {
    console.error("Error loading PDF:", err);
  });
