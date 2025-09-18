// pdfjs-setup.js
import { GlobalWorkerOptions } from "pdfjs-dist/esm/build/pdf";

// ✅ Use new URL syntax so bundlers like CRA or Vite handle it correctly
GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/esm/build/pdf.worker.min.js",
  import.meta.url
).toString();
