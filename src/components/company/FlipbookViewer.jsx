// src/components/company/FlipbookViewer.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import HTMLFlipBook from "react-pageflip";
import pdfjsLib from "../../pdfjs-setup";
import "./FlipbookViewer.css";

// -----------------------------
// Individual Page Component
// Lazy-load page canvas
// -----------------------------
const BookPage = React.forwardRef(({ pageNum, pdfDoc, containerWidth }, ref) => {
  const [canvasUrl, setCanvasUrl] = useState(null);

  const renderPage = useCallback(async () => {
    if (!pdfDoc) return;
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      const scale = containerWidth / viewport.width; // scale to fit container
      const scaledViewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      const ctx = canvas.getContext("2d");
      await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
      setCanvasUrl(canvas.toDataURL());
    } catch (err) {
      console.error(`Error rendering page ${pageNum}:`, err);
    }
  }, [pageNum, pdfDoc, containerWidth]);

  useEffect(() => {
    // Only render when component is mounted
    renderPage();
  }, [renderPage]);

  return (
    <div ref={ref} className="book-page">
      {canvasUrl ? (
        <img
          src={canvasUrl}
          alt={`Page ${pageNum}`}
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
        />
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
  const [containerWidth, setContainerWidth] = useState(400);

  const flipbookRef = useRef();

  // Load PDF
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

  // Track container width for scaling
  useEffect(() => {
    const handleResize = () => {
      if (flipbookRef.current) {
        setContainerWidth(flipbookRef.current.offsetWidth * 0.95); // 95% for padding
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
          maxWidth={800}
          minHeight={400}
          maxHeight={1000}
          drawShadow={true}
          flippingTime={800}
          usePortrait={true}
          startPage={0}
          className="flipbook"
          showCover={true}
          mobileScrollSupport={true}
          ref={flipbookRef}
        >
          {Array.from({ length: totalPages }, (_, i) => (
            <BookPage
              key={i}
              pageNum={i + 1}
              pdfDoc={pdfDoc}
              containerWidth={containerWidth}
            />
          ))}
        </HTMLFlipBook>
      ) : (
        <div className="loading-message">Loading PDF...</div>
      )}
    </div>
  );
};

export default FlipbookViewer;
