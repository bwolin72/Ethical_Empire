// src/pdfjs-setup.js
import { GlobalWorkerOptions } from "pdfjs-dist";

// Point to the worker file in /public
GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;
