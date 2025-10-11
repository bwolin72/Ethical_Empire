// src/components/FlipbookViewer.jsx
import React, { useEffect, useState, useRef, useCallback, Suspense } from "react";
import pdfjsLib from "../../pdfjs-setup";
import "./FlipbookViewer.css";

// Lazy-load the flipbook to reduce initial bundle size
const HTMLFlipBook = React.lazy(() => import("react-pageflip"));

const PDF_URL = `${process.env.PUBLIC_URL}/files/brochure.pdf`;

// Config: tweak these to balance quality vs speed
const MAX_INITIAL_PAGES = 4;      // how many pages to start rendering
const RENDER_CONCURRENCY = 3;     // how many pages to render in parallel
const SCALE_MULTIPLIER = 1.0;     // previously 1.5 — reduce for speed
const JPG_QUALITY = 0.7;          // compress images slightly
const LOCAL_CACHE_LIMIT = 5;      // max pages to cache in localStorage
const LOCAL_CACHE_MAX_BYTES = 200 * 1024; // only cache blobs smaller than this (200KB)

const FlipbookViewer = () => {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageImages, setPageImages] = useState({}); // { pageNum: objectUrlOrDataUrl }
  const [numPages, setNumPages] = useState(0);
  const [flipWidth, setFlipWidth] = useState(400);
  const [flipHeight, setFlipHeight] = useState(600);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const flipbookRef = useRef();
  const activeObjectUrls = useRef(new Set()); // track created object URLs to revoke
  const renderQueueRef = useRef([]); // pages queued to render
  const runningRendersRef = useRef(0);
  const mountedRef = useRef(true);

  // ----------------- Helper: revoke URLs on unmount or replace -----------------
  const revokeAllObjectUrls = useCallback(() => {
    activeObjectUrls.current.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    });
    activeObjectUrls.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      revokeAllObjectUrls();
    };
  }, [revokeAllObjectUrls]);

  // ----------------- Setup PDF.js worker (if not configured in pdfjs-setup) ------------
  useEffect(() => {
    try {
      // If pdfjsLib exposes GlobalWorkerOptions, ensure workerSrc is set.
      // Many setups already configure this in pdfjs-setup — this is a safe fallback.
      if (pdfjsLib && pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        // Attempt to use a worker shipped in public folder
        pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;
      }
    } catch (e) {
      // non-fatal
      // console.warn("Could not set pdf.worker src", e);
    }
  }, []);

  // ----------------- Local cache helpers (localStorage) -----------------
  const localCacheKey = "flipbook-brochure-cache-v1";

  const loadLocalCache = useCallback(() => {
    try {
      const raw = localStorage.getItem(localCacheKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) return parsed;
    } catch (e) {
      // ignore parse errors
    }
    return {};
  }, []);

  const saveLocalCache = useCallback((cacheObj) => {
    try {
      localStorage.setItem(localCacheKey, JSON.stringify(cacheObj));
    } catch (e) {
      // possible quota exceeded — ignore silently
    }
  }, []);

  // ----------------- Render a single page -----------------
  const renderPage = useCallback(
    async (pageNum) => {
      if (!pdfDoc || pageImages[pageNum] || !mountedRef.current) return;

      try {
        // Check local cache first (dataURL)
        const cache = loadLocalCache();
        if (cache[pageNum]) {
          setPageImages((prev) => {
            if (prev[pageNum]) return prev;
            return { ...prev, [pageNum]: cache[pageNum] };
          });
          return;
        }

        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1 });

        // Scale to fit half the flip width (each page is half the book width)
        const scaleX = (flipWidth / 2) / viewport.width;
        const scaleY = flipHeight / viewport.height;
        const scale = Math.max(0.5, Math.min(scaleX, scaleY) * SCALE_MULTIPLIER);

        const scaledViewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(scaledViewport.width);
        canvas.height = Math.round(scaledViewport.height);

        const ctx = canvas.getContext("2d");
        // render on worker thread (pdf.js will use worker if configured)
        await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;

        // Convert to blob to create object URL (faster to paint)
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", JPG_QUALITY)
        );

        if (!blob) throw new Error("Failed to create image blob");

        // Create an object URL for immediate display
        const objectUrl = URL.createObjectURL(blob);
        activeObjectUrls.current.add(objectUrl);

        // Update state with objectUrl
        setPageImages((prev) => {
          if (prev[pageNum]) {
            // If there's already an entry, revoke the newly created URL to avoid leak
            try { URL.revokeObjectURL(objectUrl); } catch {}
            activeObjectUrls.current.delete(objectUrl);
            return prev;
          }
          return { ...prev, [pageNum]: objectUrl };
        });

        // Optionally store a dataURL in localStorage for next visits when small enough
        if (blob.size <= LOCAL_CACHE_MAX_BYTES) {
          try {
            const reader = new FileReader();
            reader.onload = function () {
              try {
                const dataUrl = reader.result;
                const cacheObj = loadLocalCache();
                // limit number of cached pages
                const keys = Object.keys(cacheObj).map(Number).sort((a, b) => a - b);
                if (keys.length >= LOCAL_CACHE_LIMIT && keys.length > 0) {
                  delete cacheObj[keys[0]]; // remove smallest page number if full
                }
                cacheObj[pageNum] = dataUrl;
                saveLocalCache(cacheObj);
              } catch (e) {
                // ignore caching errors
              }
            };
            reader.readAsDataURL(blob);
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        console.error(`Error rendering page ${pageNum}:`, err);
      }
    },
    [pdfDoc, flipWidth, flipHeight, pageImages, loadLocalCache, saveLocalCache]
  );

  // ----------------- Concurrency queue for rendering -----------------
  const processQueue = useCallback(async () => {
    if (!mountedRef.current) return;
    while (
      renderQueueRef.current.length > 0 &&
      runningRendersRef.current < RENDER_CONCURRENCY
    ) {
      const pageNum = renderQueueRef.current.shift();
      runningRendersRef.current += 1;
      // run renderPage but don't block queue processing
      renderPage(pageNum).finally(() => {
        runningRendersRef.current -= 1;
        // attempt to continue processing queue
        if (mountedRef.current) {
          // slight delay so UI can breathe
          setTimeout(processQueue, 0);
        }
      });
    }
  }, [renderPage]);

  const queueRender = useCallback((pageNum) => {
    if (!pageNum || pageNum < 1 || (numPages && pageNum > numPages)) return;
    // avoid duplicates in queue
    if (pageImages[pageNum]) return;
    if (!renderQueueRef.current.includes(pageNum)) {
      renderQueueRef.current.push(pageNum);
    }
    // prefer requestIdleCallback when available
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(processQueue);
    } else {
      setTimeout(processQueue, 50);
    }
  }, [numPages, pageImages, processQueue]);

  // ----------------- Load PDF and start initial renders -----------------
  useEffect(() => {
    let cancelled = false;
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        const loadingTask = pdfjsLib.getDocument(PDF_URL);
        const pdf = await loadingTask.promise;

        if (cancelled || !mountedRef.current) return;

        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setLoading(false);

        // Load local cache into state immediately so first pages appear faster
        const cache = loadLocalCache();
        if (cache && Object.keys(cache).length > 0) {
          // Only add cached pages that are within numPages after we know pdf.numPages
          const newImages = {};
          Object.keys(cache).forEach((k) => {
            const p = Number(k);
            if (!isNaN(p) && p >= 1 && p <= pdf.numPages) newImages[p] = cache[k];
          });
          if (Object.keys(newImages).length > 0) {
            setPageImages((prev) => ({ ...newImages, ...prev }));
          }
        }

        // Queue initial few pages (including adjacent pages)
        const initialCount = Math.min(MAX_INITIAL_PAGES, pdf.numPages);
        for (let i = 1; i <= initialCount; i++) queueRender(i);
      } catch (err) {
        console.error("Failed to load PDF:", err);
        setError("Failed to load document.");
        setLoading(false);
      }
    };

    loadPdf();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipWidth, flipHeight]); // if size changes significantly, we may want to re-render pages

  // ----------------- Responsive sizing with debounce -----------------
  useEffect(() => {
    let resizeTimeout = null;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (flipbookRef.current) {
          const width = Math.max(300, flipbookRef.current.offsetWidth * 0.95);
          const height = Math.round(width * 1.5);
          setFlipWidth(width);
          setFlipHeight(height);
        }
      }, 160);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // ----------------- Cleanup and revoke object URLs when an image entry is removed -----------------
  useEffect(() => {
    // Whenever pageImages changes we could prune old object URLs
    return () => {
      // no-op here; object URLs are cleaned up on unmount via revokeAllObjectUrls
    };
  }, [pageImages]);

  // ----------------- Handle download -----------------
  const handleDownload = useCallback(() => {
    const link = document.createElement("a");
    link.href = PDF_URL;
    link.download = "Company_Profile.pdf";
    link.click();
  }, []);

  // ----------------- Flip handler: preload neighbor pages -----------------
  const handleFlip = useCallback((e) => {
    // e.data is page index (0-based) used by react-pageflip
    const page = e?.data + 1 || 1;
    // preload previous, current, next, and next+1
    [page - 1, page, page + 1, page + 2].forEach((p) => queueRender(p));
  }, [queueRender]);

  // ----------------- Accessibility helpers -----------------
  const downloadAriaLabel = "Download brochure PDF";

  // ----------------- Render -----------------
  return (
    <div className="flipbook-wrapper" ref={flipbookRef}>
      <header className="flipbook-header">
        <h1 className="flipbook-title">Eethm_GH — Profile</h1>
        <div className="download-container">
          <button
            className="download-btn"
            onClick={handleDownload}
            aria-label={downloadAriaLabel}
            title="Download PDF"
          >
            📥 Download PDF
          </button>
        </div>
      </header>

      {loading && <div className="loading-message">Loading PDF…</div>}
      {error && <div className="error-message" role="alert">{error}</div>}

      {!loading && !error && numPages > 0 && (
        <Suspense fallback={<div className="loading-message">Loading flipbook UI…</div>}>
          <HTMLFlipBook
            width={flipWidth}
            height={flipHeight}
            minWidth={300}
            maxWidth={900}
            minHeight={400}
            maxHeight={1200}
            size="stretch"
            drawShadow={true}
            flippingTime={700}
            usePortrait={true}
            startPage={0}
            className="flipbook"
            showCover={true}
            mobileScrollSupport={true}
            onFlip={handleFlip}
          >
            {Array.from({ length: numPages }).map((_, i) => {
              const pageNum = i + 1;
              const src = pageImages[pageNum];

              return (
                <div key={i} className="book-page" aria-label={`Page ${pageNum}`}>
                  {src ? (
                    // if cached as data URL, it's fine; if object URL, it's also fine
                    <img src={src} alt={`Page ${pageNum}`} draggable={false} />
                  ) : (
                    <div className="loading-page">
                      Loading page {pageNum}…
                    </div>
                  )}
                </div>
              );
            })}
          </HTMLFlipBook>
        </Suspense>
      )}
    </div>
  );
};

export default FlipbookViewer;
