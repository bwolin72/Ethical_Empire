import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css"; // optional base styles
import "./FlipbookViewer.css";          // your custom styles
import brochure from "../../assets/files/brochure.pdf"; // PDF file

// Set PDF.js worker (using CDN)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

const FlipbookViewer = () => {
  const viewerRef = useRef(null);
  const leftPageRef = useRef(null);
  const rightPageRef = useRef(null);

  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [animating, setAnimating] = useState(false);

  // ---------------------------
  // Render a single PDF page
  // ---------------------------
  const renderPage = useCallback(
    async (pageNum, container) => {
      if (!pdfDoc || !container || pageNum < 1 || pageNum > totalPages) {
        container.innerHTML = "<div class='blank'>Blank</div>";
        return;
      }

      try {
        const page = await pdfDoc.getPage(pageNum);

        const containerWidth = viewerRef.current?.clientWidth || 800;
        const containerHeight = viewerRef.current?.clientHeight || 600;
        const perPageWidth =
          containerWidth > 700 ? (containerWidth - 20) / 2 : containerWidth - 40;

        const viewportUnscaled = page.getViewport({ scale: 1 });
        const scaleX = perPageWidth / viewportUnscaled.width;
        const scaleY = (containerHeight - 20) / viewportUnscaled.height;
        const scale = Math.min(scaleX, scaleY, 2);

        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;

        container.innerHTML = "";
        container.appendChild(canvas);
      } catch (err) {
        console.error(`Error rendering page ${pageNum}:`, err);
        container.innerHTML = "<div class='blank'>Error loading page</div>";
      }
    },
    [pdfDoc, totalPages]
  );

  // ---------------------------
  // Display current two-page spread
  // ---------------------------
  const displayPages = useCallback(async () => {
    if (!pdfDoc) return;
    await renderPage(currentIndex, leftPageRef.current);
    await renderPage(currentIndex + 1, rightPageRef.current);
  }, [pdfDoc, currentIndex, renderPage]);

  // ---------------------------
  // Next / Prev animations
  // ---------------------------
  const animateNext = async () => {
    if (animating || currentIndex + 1 > totalPages) return;
    setAnimating(true);
    const right = rightPageRef.current;
    right.classList.add("flip-next");
    right.addEventListener(
      "transitionend",
      async () => {
        right.classList.remove("flip-next");
        setCurrentIndex((prev) => Math.min(prev + 2, totalPages));
        await displayPages();
        setAnimating(false);
      },
      { once: true }
    );
  };

  const animatePrev = async () => {
    if (animating || currentIndex <= 1) return;
    setAnimating(true);
    const left = leftPageRef.current;
    left.classList.add("flip-prev");
    left.addEventListener(
      "transitionend",
      async () => {
        left.classList.remove("flip-prev");
        setCurrentIndex((prev) => Math.max(prev - 2, 1));
        await displayPages();
        setAnimating(false);
      },
      { once: true }
    );
  };

  // ---------------------------
  // Keyboard navigation
  // ---------------------------
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") animateNext();
      if (e.key === "ArrowLeft") animatePrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [animateNext, animatePrev]);

  // ---------------------------
  // Load PDF document
  // ---------------------------
  useEffect(() => {
    const loadPdf = async () => {
      try {
        // FIX: use { url: brochure }
        const loadingTask = pdfjsLib.getDocument({ url: brochure });
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        console.log("PDF loaded, total pages:", doc.numPages);
      } catch (err) {
        console.error("Failed to load PDF:", err);
      }
    };
    loadPdf();
  }, []);

  // ---------------------------
  // Display pages when PDF loads or page changes
  // ---------------------------
  useEffect(() => {
    displayPages();
  }, [pdfDoc, currentIndex, displayPages]);

  return (
    <div className="flipbook-wrapper">
      <h1 className="flipbook-title">Company Profile — Flipbook</h1>

      <div className="flipbook-viewer" ref={viewerRef}>
        <div className="book">
          <div className="page left" ref={leftPageRef}>
            <div className="inner"></div>
          </div>
          <div className="page right" ref={rightPageRef}>
            <div className="inner"></div>
          </div>
        </div>
      </div>

      <div className="controls">
        <button
          className="btn prev"
          onClick={animatePrev}
          disabled={currentIndex <= 1 || animating}
        >
          ◀ Prev
        </button>
        <span className="page-indicator">
          Page {currentIndex} – {Math.min(currentIndex + 1, totalPages)} of{" "}
          {totalPages}
        </span>
        <button
          className="btn next"
          onClick={animateNext}
          disabled={currentIndex + 1 > totalPages || animating}
        >
          Next ▶
        </button>
      </div>
    </div>
  );
};

export default FlipbookViewer;
