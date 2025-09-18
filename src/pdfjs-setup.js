// src/pdfjs-setup.js
import { GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";

// Set PDF.js worker
GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;
