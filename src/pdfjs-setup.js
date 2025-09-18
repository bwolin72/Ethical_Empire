// src/pdfjs-setup.js
import { GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";
import PdfWorker from "./pdf.worker.js";

// Configure PDF.js to use the bundled worker
GlobalWorkerOptions.workerSrc = PdfWorker;
