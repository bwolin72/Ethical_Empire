// src/pdfjs-setup.js
import { pdfjs } from "react-pdf";

// Tell pdfjs where the worker is located (in /public)
pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;
