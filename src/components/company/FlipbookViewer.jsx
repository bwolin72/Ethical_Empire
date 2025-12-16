// src/components/company/FlipbookViewer.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import pdfjsLib from "../../pdfjs-setup";
import "./FlipbookViewer.css";

// PDF.js worker setup
if (pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;
}

// Available brochures
const BROCHURES = [
  {
    id: "company-profile",
    name: "Company Profile",
    description: "Complete company overview and services",
    file: "brochure.pdf",
    size: "2.4 MB",
    pages: 12
  },
  {
    id: "eethm-decor",
    name: "Eethm Decor",
    description: "Event decoration portfolio and packages",
    file: "EethmDecor_compressed.pdf",
    size: "1.8 MB",
    pages: 8
  },
  {
    id: "eethm-kitchen",
    name: "Eethm Kitchen",
    description: "Catering menu and culinary services",
    file: "EETHMkitchen_compressed.pdf",
    size: "2.1 MB",
    pages: 10
  }
];

// Performance configuration
const CONFIG = {
  initialPages: 3,           // Pages to load immediately
  preloadAhead: 2,           // Pages to preload ahead
  preloadBehind: 1,          // Pages to preload behind
  scale: 1.2,               // Image scale for quality
  jpgQuality: 0.85,         // JPEG compression quality
  cacheLimit: 6,            // Max cached pages per PDF
  concurrentRenders: 2,     // Simultaneous page renders
  thumbnailScale: 0.15,     // Thumbnail scale for preview
  lazyLoadDelay: 100        // Delay before lazy loading
};

const FlipbookViewer = () => {
  const [selectedBrochure, setSelectedBrochure] = useState(BROCHURES[0]);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageImages, setPageImages] = useState({}); // {pageNum: {src, thumbnail}}
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState("flipbook"); // 'flipbook' or 'slideshow'
  const [showThumbnails, setShowThumbnails] = useState(false);

  const containerRef = useRef();
  const viewerRef = useRef();
  const activeRenderRef = useRef(new Set());
  const pageCacheRef = useRef(new Map());
  const renderQueueRef = useRef([]);
  const isRenderingRef = useRef(false);

  // Get current PDF URL
  const getPdfUrl = useCallback(() => {
    return `${process.env.PUBLIC_URL}/files/${selectedBrochure.file}`;
  }, [selectedBrochure]);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Revoke object URLs
    pageCacheRef.current.forEach((pageData) => {
      if (pageData.objectUrl) {
        URL.revokeObjectURL(pageData.objectUrl);
      }
      if (pageData.thumbnailUrl) {
        URL.revokeObjectURL(pageData.thumbnailUrl);
      }
    });
    pageCacheRef.current.clear();
    activeRenderRef.current.clear();
    renderQueueRef.current = [];
  }, []);

  // Change brochure
  const handleBrochureChange = useCallback((brochure) => {
    if (brochure.id === selectedBrochure.id) return;
    
    cleanup();
    setSelectedBrochure(brochure);
    setPdfDoc(null);
    setPageImages({});
    setNumPages(0);
    setCurrentPage(1);
    setError(null);
  }, [selectedBrochure.id, cleanup]);

  // Load PDF document
  const loadPdf = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const loadingTask = pdfjsLib.getDocument({
        url: getPdfUrl(),
        cMapUrl: `${process.env.PUBLIC_URL}/cmaps/`,
        cMapPacked: true,
      });
      
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
      
      // Preload first few pages
      const pagesToLoad = Math.min(CONFIG.initialPages, pdf.numPages);
      for (let i = 1; i <= pagesToLoad; i++) {
        queuePageRender(i);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("PDF loading error:", err);
      setError(`Failed to load ${selectedBrochure.name}. Please try again.`);
      setLoading(false);
    }
  }, [getPdfUrl, selectedBrochure.name]);

  // Render single page to canvas
  const renderPageToCanvas = useCallback(async (pageNum, scale = CONFIG.scale) => {
    if (!pdfDoc || activeRenderRef.current.has(pageNum)) return null;
    
    activeRenderRef.current.add(pageNum);
    
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      
      // Create main canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      await page.render({
        canvasContext: ctx,
        viewport: viewport,
        enableWebGL: true,
      }).promise;
      
      // Create thumbnail canvas
      const thumbCanvas = document.createElement("canvas");
      const thumbCtx = thumbCanvas.getContext("2d");
      const thumbScale = CONFIG.thumbnailScale;
      thumbCanvas.width = viewport.width * thumbScale;
      thumbCanvas.height = viewport.height * thumbScale;
      
      thumbCtx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
      
      // Convert to blobs
      const mainBlob = await new Promise(resolve => 
        canvas.toBlob(resolve, "image/jpeg", CONFIG.jpgQuality)
      );
      
      const thumbBlob = await new Promise(resolve =>
        thumbCanvas.toBlob(resolve, "image/jpeg", 0.7)
      );
      
      if (!mainBlob || !thumbBlob) throw new Error("Failed to create blobs");
      
      // Create object URLs
      const objectUrl = URL.createObjectURL(mainBlob);
      const thumbnailUrl = URL.createObjectURL(thumbBlob);
      
      return { objectUrl, thumbnailUrl, width: canvas.width, height: canvas.height };
      
    } catch (err) {
      console.error(`Error rendering page ${pageNum}:`, err);
      return null;
    } finally {
      activeRenderRef.current.delete(pageNum);
    }
  }, [pdfDoc]);

  // Queue page for rendering
  const queuePageRender = useCallback((pageNum) => {
    if (pageNum < 1 || pageNum > numPages || pageCacheRef.current.has(pageNum)) {
      return;
    }
    
    if (!renderQueueRef.current.includes(pageNum)) {
      renderQueueRef.current.push(pageNum);
    }
    
    // Start processing queue if not already running
    if (!isRenderingRef.current) {
      processRenderQueue();
    }
  }, [numPages]);

  // Process render queue
  const processRenderQueue = useCallback(async () => {
    if (isRenderingRef.current || renderQueueRef.current.length === 0) return;
    
    isRenderingRef.current = true;
    
    while (renderQueueRef.current.length > 0 && activeRenderRef.current.size < CONFIG.concurrentRenders) {
      const pageNum = renderQueueRef.current.shift();
      
      if (pageCacheRef.current.has(pageNum)) continue;
      
      const pageData = await renderPageToCanvas(pageNum);
      if (pageData && !pageCacheRef.current.has(pageNum)) {
        pageCacheRef.current.set(pageNum, pageData);
        
        setPageImages(prev => ({
          ...prev,
          [pageNum]: {
            src: pageData.objectUrl,
            thumbnail: pageData.thumbnailUrl,
            width: pageData.width,
            height: pageData.height
          }
        }));
      }
    }
    
    isRenderingRef.current = false;
    
    // Schedule next batch if needed
    if (renderQueueRef.current.length > 0) {
      setTimeout(processRenderQueue, CONFIG.lazyLoadDelay);
    }
  }, [renderPageToCanvas]);

  // Preload surrounding pages
  const preloadSurroundingPages = useCallback((centerPage) => {
    if (!numPages) return;
    
    const start = Math.max(1, centerPage - CONFIG.preloadBehind);
    const end = Math.min(numPages, centerPage + CONFIG.preloadAhead);
    
    for (let i = start; i <= end; i++) {
      queuePageRender(i);
    }
  }, [numPages, queuePageRender]);

  // Handle page navigation
  const goToPage = useCallback((pageNum) => {
    const validPage = Math.max(1, Math.min(pageNum, numPages));
    setCurrentPage(validPage);
    preloadSurroundingPages(validPage);
    
    // Scroll to viewer
    if (viewerRef.current) {
      viewerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [numPages, preloadSurroundingPages]);

  // Download handler
  const handleDownload = useCallback(() => {
    const link = document.createElement("a");
    link.href = getPdfUrl();
    link.download = `${selectedBrochure.name.replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [getPdfUrl, selectedBrochure.name]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Load PDF when brochure changes
  useEffect(() => {
    loadPdf();
    return cleanup;
  }, [loadPdf, cleanup]);

  // Preload pages when current page changes
  useEffect(() => {
    if (currentPage && numPages) {
      preloadSurroundingPages(currentPage);
    }
  }, [currentPage, numPages, preloadSurroundingPages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!pdfDoc) return;
      
      switch(e.key) {
        case "ArrowLeft":
          e.preventDefault();
          goToPage(currentPage - 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          goToPage(currentPage + 1);
          break;
        case "Home":
          e.preventDefault();
          goToPage(1);
          break;
        case "End":
          e.preventDefault();
          goToPage(numPages);
          break;
        case "f":
        case "F":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pdfDoc, currentPage, numPages, goToPage, toggleFullscreen]);

  // Render page component
  const renderPage = useCallback((pageNum) => {
    const pageData = pageImages[pageNum];
    
    if (!pageData) {
      queuePageRender(pageNum);
      return (
        <div className="page-placeholder">
          <div className="page-loader"></div>
          <span>Loading page {pageNum}...</span>
        </div>
      );
    }
    
    return (
      <img
        src={pageData.src}
        alt={`${selectedBrochure.name} - Page ${pageNum}`}
        loading="lazy"
        style={{
          width: "100%",
          height: "auto",
          maxHeight: "90vh"
        }}
      />
    );
  }, [pageImages, selectedBrochure.name, queuePageRender]);

  // Render thumbnails
  const renderThumbnails = useCallback(() => {
    if (!numPages) return null;
    
    return (
      <div className="thumbnails-container">
        {Array.from({ length: numPages }, (_, i) => {
          const pageNum = i + 1;
          const pageData = pageImages[pageNum];
          const isActive = pageNum === currentPage;
          
          return (
            <button
              key={pageNum}
              className={`thumbnail ${isActive ? "active" : ""}`}
              onClick={() => goToPage(pageNum)}
              aria-label={`Go to page ${pageNum}`}
            >
              {pageData?.thumbnail ? (
                <img
                  src={pageData.thumbnail}
                  alt={`Page ${pageNum} thumbnail`}
                  loading="lazy"
                />
              ) : (
                <div className="thumbnail-placeholder">{pageNum}</div>
              )}
            </button>
          );
        })}
      </div>
    );
  }, [numPages, pageImages, currentPage, goToPage]);

  return (
    <div 
      className={`flipbook-container ${isFullscreen ? "fullscreen" : ""}`}
      ref={containerRef}
    >
      {/* Header */}
      <header className="flipbook-header">
        <div className="header-content">
          <h1 className="flipbook-title">EethmGH Multimedia Brochures</h1>
          <p className="flipbook-subtitle">Explore our service portfolios</p>
        </div>
        
        <div className="header-actions">
          <button
            className="action-btn download-btn"
            onClick={handleDownload}
            aria-label={`Download ${selectedBrochure.name} PDF`}
            title="Download PDF"
          >
            <span className="btn-icon">📥</span>
            <span className="btn-text">Download</span>
          </button>
          
          <button
            className="action-btn fullscreen-btn"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <span className="btn-icon">{isFullscreen ? "📱" : "🔍"}</span>
            <span className="btn-text">{isFullscreen ? "Exit" : "Fullscreen"}</span>
          </button>
        </div>
      </header>

      {/* Brochure Selector */}
      <div className="brochure-selector">
        <h2 className="selector-title">Select Brochure</h2>
        <div className="brochure-cards">
          {BROCHURES.map(brochure => (
            <button
              key={brochure.id}
              className={`brochure-card ${selectedBrochure.id === brochure.id ? "selected" : ""}`}
              onClick={() => handleBrochureChange(brochure)}
              aria-label={`View ${brochure.name}`}
              aria-pressed={selectedBrochure.id === brochure.id}
            >
              <div className="card-content">
                <h3 className="card-title">{brochure.name}</h3>
                <p className="card-description">{brochure.description}</p>
                <div className="card-meta">
                  <span className="meta-item">📄 {brochure.pages} pages</span>
                  <span className="meta-item">⚖️ {brochure.size}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Viewer Controls */}
      <div className="viewer-controls">
        <div className="view-mode-selector">
          <button
            className={`mode-btn ${viewMode === "flipbook" ? "active" : ""}`}
            onClick={() => setViewMode("flipbook")}
          >
            📖 Flipbook
          </button>
          <button
            className={`mode-btn ${viewMode === "slideshow" ? "active" : ""}`}
            onClick={() => setViewMode("slideshow")}
          >
            🖼️ Slideshow
          </button>
        </div>
        
        <button
          className="thumbnails-toggle"
          onClick={() => setShowThumbnails(!showThumbnails)}
          aria-label={showThumbnails ? "Hide thumbnails" : "Show thumbnails"}
        >
          {showThumbnails ? "🙈 Hide Thumbnails" : "👁️ Show Thumbnails"}
        </button>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading {selectedBrochure.name}...</p>
        </div>
      )}
      
      {error && (
        <div className="error-state" role="alert">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={loadPdf} className="retry-btn">
            Retry Loading
          </button>
        </div>
      )}

      {/* Main Viewer */}
      {!loading && !error && pdfDoc && (
        <div className="viewer-wrapper" ref={viewerRef}>
          {/* Thumbnails Sidebar */}
          {showThumbnails && (
            <div className="thumbnails-sidebar">
              <div className="thumbnails-header">
                <h3>Pages</h3>
                <button
                  className="close-thumbnails"
                  onClick={() => setShowThumbnails(false)}
                  aria-label="Close thumbnails"
                >
                  ✕
                </button>
              </div>
              {renderThumbnails()}
            </div>
          )}

          {/* Viewer Area */}
          <div className="viewer-area">
            {/* Navigation */}
            <div className="page-navigation">
              <button
                className="nav-btn prev-btn"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="Previous page"
              >
                ← Previous
              </button>
              
              <div className="page-counter">
                <span className="current-page">{currentPage}</span>
                <span className="total-pages"> / {numPages}</span>
              </div>
              
              <button
                className="nav-btn next-btn"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= numPages}
                aria-label="Next page"
              >
                Next →
              </button>
            </div>

            {/* Page Display */}
            <div className="page-display">
              {viewMode === "slideshow" ? (
                <div className="slideshow-container">
                  {renderPage(currentPage)}
                </div>
              ) : (
                <div className="flipbook-view">
                  <div className="page-spread">
                    {/* Left page (if applicable) */}
                    {currentPage > 1 && (
                      <div className="page-left">
                        {renderPage(currentPage - 1)}
                      </div>
                    )}
                    
                    {/* Current page */}
                    <div className="page-center">
                      {renderPage(currentPage)}
                    </div>
                    
                    {/* Right page (if applicable) */}
                    {currentPage < numPages && (
                      <div className="page-right">
                        {renderPage(currentPage + 1)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Navigation */}
            <div className="quick-nav">
              <input
                type="range"
                min="1"
                max={numPages}
                value={currentPage}
                onChange={(e) => goToPage(parseInt(e.target.value))}
                className="page-slider"
                aria-label="Navigate through pages"
              />
              
              <div className="page-input-group">
                <label htmlFor="page-input">Go to page:</label>
                <input
                  id="page-input"
                  type="number"
                  min="1"
                  max={numPages}
                  value={currentPage}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) goToPage(value);
                  }}
                  className="page-input"
                  aria-label="Enter page number"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <footer className="flipbook-footer">
        <div className="footer-info">
          <p className="current-brochure">
            Viewing: <strong>{selectedBrochure.name}</strong> • {selectedBrochure.pages} pages • {selectedBrochure.size}
          </p>
          <p className="navigation-tip">
            Tip: Use arrow keys to navigate, Ctrl/Cmd + F for fullscreen
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FlipbookViewer;
