// src/components/context/MediaCards.jsx
import React, { useState } from "react";
import useFetcher from "../../hooks/useFetcher"; // ✅ correct import
import SingleMediaCard from "./MediaCard";
import MediaSkeleton from "./MediaSkeleton";
import placeholderImg from "../../assets/placeholder.jpg";
import "./MediaCard.css";

const MediaCards = ({
  endpointKey = "media", // ✅ match useFetcher
  resourceType = "media", // "media" | "videos"
  title,
  fullWidth = false,
  isActive = true,
  isFeatured = false,
  fileType = "",
  labelQuery = "",
}) => {
  const [previewMedia, setPreviewMedia] = useState(null);

  // 🔑 call useFetcher with resourceType + endpointKey
  const { data, loading, error } = useFetcher(resourceType, endpointKey, {
    is_active: isActive,
    is_featured: isFeatured,
    file_type: fileType,
    label: labelQuery,
  });

  // ✅ normalize
  const mediaItems = Array.isArray(data) ? data : [];

  return (
    <section className="media-cards-container">
      {title && <h2 className="media-cards-title">{title}</h2>}

      <div className={`media-cards-scroll-wrapper ${fullWidth ? "full" : ""}`}>
        {loading ? (
          <MediaSkeleton count={3} />
        ) : error ? (
          <p className="media-error">⚠️ {error.message || "Failed to load media"}</p>
        ) : mediaItems.length === 0 ? (
          <p className="media-card-empty">📭 No {resourceType} uploaded.</p>
        ) : (
          mediaItems.map((media) => (
            <div
              key={media.id || media.url?.full || media.label}
              className="media-card-wrapper"
              onClick={() => setPreviewMedia(media)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setPreviewMedia(media)}
            >
              <SingleMediaCard media={media} fullWidth={fullWidth} />
            </div>
          ))
        )}
      </div>

      {/* === Modal Preview === */}
      {previewMedia && (
        <div className="media-modal" onClick={() => setPreviewMedia(null)}>
          <div
            className="media-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-button"
              onClick={() => setPreviewMedia(null)}
            >
              ✖
            </button>

            {previewMedia.file_type?.includes("video") ? (
              <video
                src={previewMedia.url?.full}
                controls
                className="modal-media-content"
              />
            ) : (
              <img
                src={previewMedia.url?.full || placeholderImg}
                alt={previewMedia.label || "Preview"}
                className="modal-media-content"
                onError={(e) => (e.target.src = placeholderImg)}
              />
            )}

            {previewMedia.label && (
              <p className="modal-media-caption">{previewMedia.label}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default MediaCards;
