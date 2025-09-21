// src/components/FlipbookViewer.jsx
import React, { useEffect, useState, useRef } from "react";
import HTMLFlipBook from "react-pageflip";
import pdfjsLib from "../../pdfjs-setup";
import "./FlipbookViewer.css";

const FlipbookViewer = () => {
  const [pageImages, setPageImages] = useState([]);   // base64 images for all pages
  const [flipWidth, setFlipWidth] = useState(400);
  const [flipHeight, setFlipHeight] = useState(600);
  const [loading, setLoading] = useState(true);

  const flipbookRef = useRef();

  // ---------- Load and Render PDF pages once ----------
  useEffect(() => {
    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(
          `${process.env.PUBLIC_URL}/files/brochure.pdf`
        );
        const pdfDoc = await loadingTask.promise;

        const images = await Promise.all(
          Array.from({ length: pdfDoc.numPages }, async (_, i) => {
            const page = await pdfDoc.getPage(i + 1);

            // Base viewport for scale=1
            const viewport = page.getViewport({ scale: 1 });

            // Scale to fit width/height, plus extra 1.5x for sharper text
            const scaleX = (flipWidth / 2) / viewport.width;
            const scaleY = flipHeight / viewport.height;
            const scale = Math.min(scaleX, scaleY) * 1.5;   // <-- bump dpi

            const scaledViewport = page.getViewport({ scale });

            const canvas = document.createElement("canvas");
            canvas.width = scaledViewport.width;
            canvas.height = scaledViewport.height;
            const ctx = canvas.getContext("2d");

            await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
            return canvas.toDataURL("image/png");
          })
        );

        setPageImages(images);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load or render PDF:", err);
        setLoading(false);
      }
    };

    loadPdf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipWidth, flipHeight]); // re-render pages when container size changes

  // ---------- Responsive Sizing ----------
  useEffect(() => {
    const handleResize = () => {
      if (flipbookRef.current) {
        const width = flipbookRef.current.offsetWidth * 0.95;
        const height = width * 1.5; // 2:3 aspect ratio
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

      {!loading && pageImages.length > 0 && (
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
        >
          {pageImages.map((img, i) => (
            <div key={i} className="book-page">
              <img src={img} alt={`Page ${i + 1}`} />
            </div>
          ))}
        </HTMLFlipBook>
      )}
    </div>
  );
};

export default FlipbookViewer;
