/* eslint-disable import/no-webpack-loader-syntax */
import { GlobalWorkerOptions } from "pdfjs-dist";

// ✅ Tell pdf.js to use its own bundled worker
import worker from "pdfjs-dist/build/pdf.worker.min.js";

GlobalWorkerOptions.workerSrc = worker;

