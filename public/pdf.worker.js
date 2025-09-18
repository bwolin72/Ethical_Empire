// pdf.worker.js
// This file is just a simple entry point to the PDF.js worker
// Place it in public/ for CRA compatibility

import { GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";

// NOTE: When building with CRA, the worker path is relative to the public folder
GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.js`;

