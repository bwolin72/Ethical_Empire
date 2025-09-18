// pdfjs-setup.js
import { GlobalWorkerOptions } from "pdfjs-dist/esm/build/pdf";

// Directly reference the worker file from the ESM build
GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/esm/build/pdf.worker.min.js",
  import.meta.url
).href; // use .href to ensure a string URL
