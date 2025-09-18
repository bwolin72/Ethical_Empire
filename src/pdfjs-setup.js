// src/pdfjs-setup.js
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker (use CDN or local build)
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export default pdfjsLib;
