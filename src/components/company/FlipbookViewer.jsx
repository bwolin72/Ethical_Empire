import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";      // optional base styles
import "./FlipbookViewer.css";               // your custom styles

// --------------------
// pdf.js v5: set worker from CDN (no ?url import needed)
// --------------------
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

const FlipbookViewer = () => {
  // ✅ Place brochure.pdf in public/asset/files/
  //    It will be served at  https://yourdomain/asset/files/brochure.pdf
  const pdfPath = "/asset/files/brochure.pdf";

  const viewerRef = useRef(null);
  const leftPageRef = useRef(null);
  const rightPageRef = useRef(null);

  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [animating, setAnimating] = useState(false);

  const renderPage = useCallback(
    async (pageNum, container) => {
      if (!pdfDoc || pageNum < 1 || pageNum > totalPages) {
        container.innerHTML = "<div class='blank'>Blank</div>";
        return;
      }

      const page = await pdfDoc.getPage(pageNum);

      const containerWidth = viewerRef.current?.clientWidth || 800;
      const containerHeight = viewerRef.current?.clientHeight || 600;
      const perPageWidth =
        containerWidth > 700 ? (containerWidth - 20) / 2 : containerWidth - 40;

      const unscaled = page.getViewport({ scale: 1 });
      const scaleX = perPageWidth / unscaled.width;
      const scaleY = (containerHeight - 20) / unscaled.height;
      const scale = Math.min(scaleX, scaleY, 2);

      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext("2d");
      await page.render({ canvasContext: ctx, viewport }).promise;

      container.innerHTML = "";
      container.appendChild(canvas);
    },
    [pdfDoc, totalPages]
  );

  const displayPages = useCallback(async () => {
    if (!pdfDoc || !leftPageRef.current || !rightPageRef.current) return;
    await renderPage(currentIndex, leftPageRef.current);
    await renderPage(currentIndex + 1, rightPageRef.current);
  }, [pdfDoc, currentIndex, renderPage]);

  const animateNext = async () => {
    if (animating || currentIndex + 1 > totalPages) return;
    setAnimating(true);
    const right = rightPageRef.current;
    right.classList.add("flip-next");
    right.addEventListener(
      "transitionend",
      async () => {
        right.classList.remove("flip-next");
        setCurrentIndex((prev) => Math.min(prev + 1, totalPages));
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
        setCurrentIndex((prev) => Math.max(prev - 1, 1));
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
  });

  // Load PDF
  useEffect(() => {
    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(pdfPath);
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
      } catch (err) {
        console.error("Failed to load PDF:", err);
      }
    };
    loadPdf();
  }, [pdfPath]);

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
          Page {Math.min(currentIndex, totalPages)} –{" "}
          {Math.min(currentIndex + 1, totalPages)} of {totalPages}
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
