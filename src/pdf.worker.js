import pdfjsLib from "pdfjs-dist/legacy/build/pdf";

// CRA-compatible worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "./pdf.worker.min.js",
  import.meta.url
).href;
