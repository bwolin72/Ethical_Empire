/* eslint-disable import/no-webpack-loader-syntax */
import { GlobalWorkerOptions } from "pdfjs-dist";

// ✅ Tell pdf.js to use its own bundled worker (v5+ uses .mjs)
import worker from "pdfjs-dist/build/pdf.worker.min.mjs";

GlobalWorkerOptions.workerSrc = worker;
