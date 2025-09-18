// src/pdfjs-setup.js
import { GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";

// Use the worker in the public folder
GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;
