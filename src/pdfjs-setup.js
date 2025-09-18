import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";
import brochure from "./assets/files/brochure.pdf"; // ensure relative path is correct

// Set PDF.js worker
GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

// Load PDF
const loadingTask = getDocument({ url: brochure });

loadingTask.promise
  .then((pdf) => {
    console.log("PDF loaded:", pdf);
  })
  .catch((err) => {
    console.error("Error loading PDF:", err);
  });
