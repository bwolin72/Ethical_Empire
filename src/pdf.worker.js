/* eslint-disable import/no-webpack-loader-syntax */
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";

// ✅ Use new URL so CRA + Webpack handle it
GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
);
