// pdfjs-setup.js
import { GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";

// ✅ Use legacy UMD worker from public folder
GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

