// src/components/company/FlipbookViewer.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import pdfjsLib from "../../pdfjs-setup"; // ✅ PDF.js worker setup
import "./FlipbookViewer.css";

const FlipbookViewer = () => {
  const viewerRef = useRef(null);
  const leftPageRef = useRef(null);
  const rightPageRef = useRef(null);

  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [animating, setAnimating] = useState(false);

  // -----------------------------
  // Render a single PDF page
  // -----------------------------
  const renderPage = useCallback(
    async (pageNum, container) => {
      container.innerHTML = "";

      if (!pdfDoc || !container || pageNum < 1 || pageNum > totalPages) {
        // Draw blank page
        const blankCanvas = document.createElement("canvas");
        blankCanvas.width = 400;
        blankCanvas.height = 600;
        const ctx = blankCanvas.getContext("2d");
        ctx.fillStyle = "#f5f5f5";
        ctx.fillRect(0, 0, blankCanvas.width, blankCanvas.height);
        ctx.fillStyle = "#999";
        ctx.font = "20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Blank", blankCanvas.width / 2, blankCanvas.height / 2);
        container.appendChild(blankCanvas);
        return;
      }

      try {
        const page = await pdfDoc.getPage(pageNum);
        const containerWidth = viewerRef.current?.clientWidth || 800;
        const containerHeight = viewerRef.current?.clientHeight || 600;
        const perPageWidth = containerWidth / 2;

        const viewportUnscaled = page.getViewport({ scale: 1 });
        const scaleX = perPageWidth / viewportUnscaled.width;
        const scaleY = containerHeight / viewportUnscaled.height;
        const scale = Math.min(scaleX, scaleY, 2);

        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;

        container.appendChild(canvas);
      } catch (err) {
        console.error(`Error rendering page ${pageNum}:`, err);
      }
    },
    [pdfDoc, totalPages]
  );

  // -----------------------------
  // Display two-page spread
  // -----------------------------
  const displayPages = useCallback(async () => {
    await renderPage(currentIndex, leftPageRef.current);
    await renderPage(currentIndex + 1, rightPageRef.current);
  }, [currentIndex, renderPage]);

  // -----------------------------
  // Navigation
  // -----------------------------
  const animateNext = async () => {
    if (animating || currentIndex >= totalPages) return;
    setAnimating(true);
    setCurrentIndex((prev) => Math.min(prev + 2, totalPages));
    await displayPages();
    setAnimating(false);
  };

  const animatePrev = async () => {
    if (animating || currentIndex <= 1) return;
    setAnimating(true);
    setCurrentIndex((prev) => Math.max(prev - 2, 1));
    await displayPages();
    setAnimating(false);
  };

  // -----------------------------
  // Keyboard navigation
  // -----------------------------
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") animateNext();
      if (e.key === "ArrowLeft") animatePrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [animateNext, animatePrev]);

  // -----------------------------
  // Load PDF (from public folder)
  // -----------------------------
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

  // -----------------------------
  // Update pages
  // -----------------------------
  useEffect(() => {
    if (pdfDoc) displayPages();
  }, [pdfDoc, currentIndex, displayPages]);

  return (
    <div className="flipbook-wrapper">
      <h1 className="flipbook-title">Company Profile — Flipbook</h1>
      <div className="flipbook-viewer" ref={viewerRef}>
        <button
          className="nav-btn prev"
          onClick={animatePrev}
          disabled={currentIndex <= 1 || animating}
        >
          ◀
        </button>
        <div className="book">
          <div className="page left" ref={leftPageRef}></div>
          <div className="page right" ref={rightPageRef}></div>
        </div>
        <button
          className="nav-btn next"
          onClick={animateNext}
          disabled={currentIndex + 1 > totalPages || animating}
        >
          ▶
        </button>
      </div>
      <div className="page-indicator">
        Page {currentIndex} – {Math.min(currentIndex + 1, totalPages)} of {totalPages}
      </div>
    </div>
  );
};

export default FlipbookViewer;
