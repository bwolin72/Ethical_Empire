
// src/components/company/FlipbookViewer.jsx
import React, { useEffect, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import pdfjsLib from "../../pdfjs-setup"; // ✅ PDF.js worker setup
import "./FlipbookViewer.css";

// -----------------------------
// Individual Page Component
// -----------------------------
const BookPage = React.forwardRef(({ pageNum, pdfDoc }, ref) => {
  const [canvasUrl, setCanvasUrl] = useState(null);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc) return;
      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;
        setCanvasUrl(canvas.toDataURL());
      } catch (err) {
        console.error(`Error rendering page ${pageNum}:`, err);
      }
    };
    renderPage();
  }, [pageNum, pdfDoc]);

  return (
    <div ref={ref} className="book-page">
      {canvasUrl ? (
        <img src={canvasUrl} alt={`Page ${pageNum}`} />
      ) : (
        <div className="page-placeholder">Loading...</div>
      )}
    </div>
  );
});

// -----------------------------
// Flipbook Component
// -----------------------------
const FlipbookViewer = () => {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);

  // Load PDF (from public folder)
  useEffect(() => {
    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(
          `${process.env.PUBLIC_URL}/files/brochure.pdf`
        );
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
      } catch (err) {
        console.error("Failed to load PDF:", err);
      }
    };
    loadPdf();
  }, []);

  return (
    <div className="flipbook-wrapper">
      <h1 className="flipbook-title">Company Profile — Flipbook</h1>

      {pdfDoc ? (
        <HTMLFlipBook
          width={400}
          height={600}
          size="stretch"
          minWidth={300}
          maxWidth={600}
          minHeight={400}
          maxHeight={800}
          drawShadow={true}
          flippingTime={800}
          usePortrait={true}
          startPage={0}
          className="flipbook"
          showCover={true}
          mobileScrollSupport={true}
        >
          {Array.from({ length: totalPages }, (_, i) => (
            <BookPage key={i} pageNum={i + 1} pdfDoc={pdfDoc} />
          ))}
        </HTMLFlipBook>
      ) : (
        <div className="loading-message">Loading PDF...</div>
      )}
    </div>
  );
};

export default FlipbookViewer;