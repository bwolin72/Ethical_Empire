// src/pages/admin/MediaManagement.jsx
import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import mediaAPI from "../../api/mediaAPI";
import "./MediaManagement.css";

const endpoints = [
  { label: "Home", value: "EethmHome" },
  { label: "User Page", value: "UserPage" },
  { label: "About", value: "About" },
  { label: "Catering", value: "CateringPage" },
  { label: "Live Band", value: "LiveBandServicePage" },
  { label: "Decor", value: "DecorPage" },
  { label: "Media Hosting", value: "MediaHostingServicePage" },
  { label: "Vendor Page", value: "VendorPage" },
  { label: "Partner Page", value: "PartnerPage" },
  { label: "Partner Vendor Dashboard", value: "PartnerVendorDashboard" },
];

const MAX_FILE_SIZE_MB = 100;
const ACCEPTED_FILE_TYPES = [
  "image/",
  "video/",
  "application/pdf",
  "application/msword",
  "application/vnd.ms-excel",
  "text/plain",
];

function SortableMediaCard({
  item,
  toggleActive,
  toggleFeatured,
  deleteMedia,
  restoreMedia,
  setPreviewItem,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const renderPreview = (url) => {
    if (!url) return <span>Broken link</span>;
    const ext = url.split(".").pop().toLowerCase();
    if (["mp4", "webm", "ogg"].includes(ext))
      return <video src={url} controls className="media-preview" />;
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext))
      return <img src={url} alt="preview" className="media-preview" />;
    return (
      <a href={url} target="_blank" rel="noreferrer">
        Open File
      </a>
    );
  };

  return (
    <div ref={setNodeRef} style={style} className="media-card">
      <div className="media-card-header">
        <span className="drag-handle" {...attributes} {...listeners}>
          ☰
        </span>
        <div
          onClick={() => setPreviewItem(item)}
          style={{ cursor: "pointer", flex: 1 }}
        >
          {renderPreview(item.url?.thumb || item.url?.full)}
        </div>
      </div>
      <p className="media-label">
        <strong>{item.label || "No Label"}</strong>
      </p>
      <p className="media-meta">Uploaded by: {item.uploaded_by || "—"}</p>
      <p className="media-meta">
        Date: {new Date(item.uploaded_at).toLocaleString()}
      </p>
      <div className="media-actions">
        <p>Status: {item.is_active ? "✅ Active" : "❌ Inactive"}</p>
        {"is_featured" in item && (
          <p>Featured: {item.is_featured ? "⭐ Yes" : "—"}</p>
        )}
        {item.is_deleted ? (
          <button onClick={() => restoreMedia(item.id)}>Restore</button>
        ) : (
          <>
            <button onClick={() => toggleActive(item.id)}>
              {item.is_active ? "Deactivate" : "Activate"}
            </button>
            {"is_featured" in item && (
              <button onClick={() => toggleFeatured(item.id)}>
                {item.is_featured ? "Unset Featured" : "Set Featured"}
              </button>
            )}
            <button onClick={() => deleteMedia(item.id)}>Delete</button>
          </>
        )}
      </div>
    </div>
  );
}

const MediaManagement = () => {
  const [mediaType, setMediaType] = useState("media");
  const [selectedEndpoints, setSelectedEndpoints] = useState(["EethmHome"]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [files, setFiles] = useState([]);
  const [uploadedItems, setUploadedItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewItem, setPreviewItem] = useState(null);
  const [label, setLabel] = useState("");

  const sensors = useSensors(useSensor(PointerSensor));

  const fetchMedia = useCallback(async () => {
    try {
      const params = { endpoint: selectedEndpoints[0] };
      let res;
      if (mediaType === "featured") res = await mediaAPI.featured();
      else if (mediaType === "banner") res = await mediaAPI.banners();
      else res = await mediaAPI.all(params);

      const items =
        Array.isArray(res?.data) ? res.data : res?.data?.results ?? [];
      setUploadedItems(items);
    } catch (err) {
      console.error("fetchMedia error:", err);
      toast.error("Failed to load media.");
      setUploadedItems([]);
    }
  }, [mediaType, selectedEndpoints]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const invalidFiles = selected.filter(
      (file) =>
        !ACCEPTED_FILE_TYPES.some((type) => file.type.startsWith(type)) ||
        file.size > MAX_FILE_SIZE_MB * 1024 * 1024
    );
    if (invalidFiles.length) {
      invalidFiles.forEach((file) =>
        toast.warn(
          `${file.name} ${
            file.size > MAX_FILE_SIZE_MB * 1024 * 1024
              ? "exceeds 100MB limit"
              : "not an allowed type"
          }`
        )
      );
      return;
    }
    setFiles(selected);
  };

  const handleUpload = async () => {
    if (!files.length) return toast.warn("Select at least one file.");
    setUploading(true);
    setUploadProgress(0);

    try {
      await mediaAPI.upload(files, {
        type: mediaType === "featured" ? "media" : mediaType,
        label: label || "Untitled",
        endpoint: selectedEndpoints,
        onUploadProgress: (percent) => setUploadProgress(percent),
      });
      fetchMedia();
      setFiles([]);
      setLabel("");
      toast.success("Upload successful!");
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Upload failed.";
      toast.error(msg);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const toggleActive = async (id) => {
    try {
      const { data } = await mediaAPI.toggle(id);
      setUploadedItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_active: data.is_active } : item
        )
      );
      toast.info(data.is_active ? "Activated." : "Deactivated.");
    } catch {
      toast.error("Toggle failed.");
    }
  };

  const toggleFeatured = async (id) => {
    try {
      const { data } = await mediaAPI.toggleFeatured(id);
      setUploadedItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_featured: data.is_featured } : item
        )
      );
      toast.info(data.is_featured ? "Marked Featured." : "Unmarked.");
    } catch {
      toast.error("Feature toggle failed.");
    }
  };

  const deleteMedia = async (id) => {
    if (!window.confirm("Delete this media?")) return;
    try {
      await mediaAPI.delete(id);
      setUploadedItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Media deleted.");
    } catch {
      toast.error("Deletion failed.");
    }
  };

  const restoreMedia = async (id) => {
    try {
      const { data } = await mediaAPI.restore(id);
      setUploadedItems((prev) =>
        prev.map((item) => (item.id === id ? data.data : item))
      );
      toast.success("Media restored.");
    } catch {
      toast.error("Restore failed.");
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = uploadedItems.findIndex((i) => i.id === active.id);
    const newIndex = uploadedItems.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(uploadedItems, oldIndex, newIndex);
    setUploadedItems(reordered);

    try {
      const payload = reordered.map((item, idx) => ({
        id: item.id,
        position: idx,
      }));
      await mediaAPI.reorder(payload);
      toast.success("Order updated.");
    } catch {
      toast.error("Reorder failed.");
    }
  };

  const filteredItems = uploadedItems.filter((item) => {
    const labelMatch = item.label
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "active" && item.is_active) ||
      (statusFilter === "inactive" && !item.is_active);
    return labelMatch && statusMatch;
  });

  return (
    <div className="admin-dashboard-preview">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>
        {mediaType === "media"
          ? "Media Uploads"
          : mediaType === "banner"
          ? "Banner Uploads"
          : "Featured Media"}
      </h2>

      {/* Controls */}
      <div className="media-controls">
        <input type="file" multiple onChange={handleFileChange} />
        <input
          type="text"
          placeholder="Enter media label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search media..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          multiple
          value={selectedEndpoints}
          onChange={(e) =>
            setSelectedEndpoints(
              Array.from(e.target.selectedOptions, (opt) => opt.value)
            )
          }
        >
          {endpoints.map((ep) => (
            <option key={ep.value} value={ep.value}>
              {ep.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button onClick={handleUpload} disabled={uploading || !files.length}>
          {uploading ? `Uploading ${uploadProgress}%` : "Upload"}
        </button>
        <button
          onClick={() =>
            setMediaType(
              mediaType === "media"
                ? "banner"
                : mediaType === "banner"
                ? "featured"
                : "media"
            )
          }
        >
          Switch to{" "}
          {mediaType === "media"
            ? "Banner"
            : mediaType === "banner"
            ? "Featured"
            : "Media"}
        </button>
      </div>

      {/* Media List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredItems.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="media-list">
            {filteredItems.length === 0 && <p>No media found.</p>}
            {filteredItems.map((item) => (
              <SortableMediaCard
                key={item.id}
                item={item}
                toggleActive={toggleActive}
                toggleFeatured={toggleFeatured}
                deleteMedia={deleteMedia}
                restoreMedia={restoreMedia}
                setPreviewItem={setPreviewItem}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Preview Overlay */}
      {previewItem && (
        <div
          className="preview-overlay"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="preview-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-button"
              onClick={() => setPreviewItem(null)}
            >
              Close
            </button>
            <h3>Preview</h3>
            {(() => {
              const url = previewItem.url?.full || previewItem.url?.thumb;
              if (!url) return <span>No preview available</span>;
              const ext = url.split(".").pop().toLowerCase();
              if (["mp4", "webm", "ogg"].includes(ext))
                return <video src={url} controls className="media-preview" />;
              return <img src={url} alt="preview" className="media-preview" />;
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaManagement;
