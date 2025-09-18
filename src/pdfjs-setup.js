// src/pdfjs-setup.js
import { GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";

// Configure PDF.js to use the worker from the public folder
// No import from src; worker must be placed in public/pdf.worker.min.js
GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;
