// src/components/FlipbookViewer.jsx
import React, { useEffect, useState, useRef } from "react";
import HTMLFlipBook from "react-pageflip";
import pdfjsLib from "../../pdfjs-setup";
import "./FlipbookViewer.css";

const FlipbookViewer = () => {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageImages, setPageImages] = useState({}); // { pageNum: image }
  const [numPages, setNumPages] = useState(0);
  const [flipWidth, setFlipWidth] = useState(400);
  const [flipHeight, setFlipHeight] = useState(600);
  const [loading, setLoading] = useState(true);

  const flipbookRef = useRef();

  // ---------- Render Single Page ----------
  const renderPage = async (pageNum) => {
    if (!pdfDoc || pageImages[pageNum]) return; // already rendered

    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });

      const scaleX = (flipWidth / 2) / viewport.width;
      const scaleY = flipHeight / viewport.height;
      const scale = Math.min(scaleX, scaleY) * 1.5;

      const scaledViewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      const ctx = canvas.getContext("2d");
      await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;

      setPageImages((prev) => ({
        ...prev,
        [pageNum]: canvas.toDataURL("image/png"),
      }));
    } catch (err) {
      console.error(`Error rendering page ${pageNum}:`, err);
    }
  };

  // ---------- Load PDF & Preload First Pages ----------
  useEffect(() => {
    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(
          `${process.env.PUBLIC_URL}/files/brochure.pdf`
        );
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);

        // Preload first 2 pages for instant viewing
        renderPage(1);
        renderPage(2);

        setLoading(false);
      } catch (err) {
        console.error("Failed to load PDF:", err);
        setLoading(false);
      }
    };

    loadPdf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipWidth, flipHeight]);

  // ---------- Responsive Sizing ----------
  useEffect(() => {
    const handleResize = () => {
      if (flipbookRef.current) {
        const width = flipbookRef.current.offsetWidth * 0.95;
        const height = width * 1.5; // keep 2:3 ratio
        setFlipWidth(width);
        setFlipHeight(height);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flipbook-wrapper" ref={flipbookRef}>
      <h1 className="flipbook-title">Company Profile — Flipbook</h1>

      {loading && <div className="loading-message">Loading PDF…</div>}

      {!loading && numPages > 0 && (
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
          onFlip={(e) => {
            const page = e.data + 1; // current page index (0-based)
            renderPage(page);
            renderPage(page + 1); // preload next page
          }}
        >
          {Array.from({ length: numPages }).map((_, i) => (
            <div key={i} className="book-page">
              {pageImages[i + 1] ? (
                <img src={pageImages[i + 1]} alt={`Page ${i + 1}`} />
              ) : (
                <div className="loading-page">Loading page {i + 1}…</div>
              )}
            </div>
          ))}
        </HTMLFlipBook>
      )}
    </div>
  );
};

export default FlipbookViewer;
