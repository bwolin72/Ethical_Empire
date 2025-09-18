import React, { useState, useCallback } from "react";
import useFetcher from "../../hooks/useFetcher";
import SingleMediaCard from "./MediaCard";
import MediaSkeleton from "./MediaSkeleton";
import placeholderImg from "../../assets/placeholder.jpg";
import "./MediaCard.css";

const MediaCards = ({
  endpointKey = "all",
  resourceType = "media",
  title,
  fullWidth = false,
  isActive = true,
  isFeatured = false,
  fileType = "",
  labelQuery = "",
}) => {
  const [previewMedia, setPreviewMedia] = useState(null);

  const { data, loading, error } = useFetcher(resourceType, endpointKey, {
    is_active: isActive,
    is_featured: isFeatured,
    file_type: fileType,
    label: labelQuery,
  });

  const mediaItems = Array.isArray(data) ? data.filter(Boolean) : [];

  const isVideoType = useCallback(
    (type) => typeof type === "string" && type.toLowerCase().includes("video"),
    []
  );

  const renderPreviewModal = (media) => (
    <div
      className="media-modal"
      onClick={() => setPreviewMedia(null)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-preview-title"
      aria-describedby="media-preview-caption"
    >
      <div className="media-modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="close-button"
          onClick={() => setPreviewMedia(null)}
          aria-label="Close preview"
        >
          ✖
        </button>

        {isVideoType(media?.file_type) ? (
          <video
            src={media?.url?.full}
            controls
            className="modal-media-content"
            poster={media?.url?.thumb || placeholderImg}
          />
        ) : (
          <img
            src={media?.url?.full || placeholderImg}
            alt={media?.label || "Preview"}
            className="modal-media-content"
            onError={(e) => (e.currentTarget.src = placeholderImg)}
          />
        )}

        {media?.label && (
          <p id="media-preview-caption" className="modal-media-caption">
            {media.label}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <section className="media-cards-container">
      {title && <h2 id="media-preview-title" className="media-cards-title">{title}</h2>}

      <div className={`media-cards-scroll-wrapper ${fullWidth ? "full" : ""}`}>
        {loading ? (
          <MediaSkeleton count={3} />
        ) : error ? (
          <p className="media-error">
            ⚠️ {error.message || `Failed to load ${resourceType}`}
          </p>
        ) : mediaItems.length === 0 ? (
          <p className="media-card-empty">📭 No {resourceType} uploaded.</p>
        ) : (
          mediaItems.map((media, idx) => (
            <SingleMediaCard
              key={media?.id || media?.url?.full || media?.label || idx}
              media={media}
              fullWidth={fullWidth}
              onClick={() => setPreviewMedia(media)}
            />
          ))
        )}
      </div>

      {previewMedia && renderPreviewModal(previewMedia)}
    </section>
  );
};

export default MediaCards;
