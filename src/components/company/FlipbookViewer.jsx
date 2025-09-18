// src/components/company/FlipbookViewer.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";
import "pdfjs-dist/web/pdf_viewer.css"; // optional base styles
import "./FlipbookViewer.css";          // your custom styles

// PDF file bundled from src/assets
import brochure from "../../assets/files/brochure.pdf";

// ✅ CRA-compatible PDF.js worker
GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

const FlipbookViewer = () => {
  const viewerRef = useRef(null);
  const leftPageRef = useRef(null);
  const rightPageRef = useRef(null);

  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [animating, setAnimating] = useState(false);

  // Render a single page
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

  // Display two-page spread
  const displayPages = useCallback(async () => {
    if (!pdfDoc) return;
    await renderPage(currentIndex, leftPageRef.current);
    await renderPage(currentIndex + 1, rightPageRef.current);
  }, [pdfDoc, currentIndex, renderPage]);

  // Next/Prev animations
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

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") animateNext();
      if (e.key === "ArrowLeft") animatePrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [animateNext, animatePrev]);

  // Load PDF
  useEffect(() => {
    const loadPdf = async () => {
      try {
        const loadingTask = getDocument({ url: brochure });
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

  // Display pages when PDF or current index changes
  useEffect(() => {
    displayPages();
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
          <div className="page left" ref={leftPageRef}>
            <div className="inner"></div>
          </div>
          <div className="page right" ref={rightPageRef}>
            <div className="inner"></div>
          </div>
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
