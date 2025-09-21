import React, { useEffect, useState, useRef, useCallback } from "react";
import HTMLFlipBook from "react-pageflip";
import pdfjsLib from "../../pdfjs-setup";
import "./FlipbookViewer.css";

// -----------------------------
// Individual Page Component
// -----------------------------
const BookPage = React.forwardRef(({ pageNum, pdfDoc, width, height }, ref) => {
  const [canvasUrl, setCanvasUrl] = useState(null);

  const renderPage = useCallback(async () => {
    if (!pdfDoc) return;
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });

      // Compute scale to fit both width & height
      const scaleX = width / viewport.width;
      const scaleY = height / viewport.height;
      const scale = Math.min(scaleX, scaleY);

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
  }, [pageNum, pdfDoc, width, height]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

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
  const [flipWidth, setFlipWidth] = useState(400);
  const [flipHeight, setFlipHeight] = useState(600);

  const flipbookRef = useRef();

  // Load PDF
  useEffect(() => {
    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(`${process.env.PUBLIC_URL}/files/brochure.pdf`);
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
      } catch (err) {
        console.error("Failed to load PDF:", err);
      }
    };
    loadPdf();
  }, []);

  // Handle resizing
  useEffect(() => {
    const handleResize = () => {
      if (flipbookRef.current) {
        const width = flipbookRef.current.offsetWidth * 0.95;
        const height = width * 1.5; // adjust aspect ratio
        setFlipWidth(width);
        setFlipHeight(height);
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
          width={flipWidth}
          height={flipHeight}
          minWidth={300}
          maxWidth={900}
          minHeight={400}
          maxHeight={1200}
          size="stretch"
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
              width={flipWidth / 2}  // each page width
              height={flipHeight}     // each page height
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
