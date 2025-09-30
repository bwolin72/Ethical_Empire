// src/pages/admin/MediaManagement.jsx
import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import mediaAPI from "../../api/mediaAPI";
import "./MediaManagement.css";

const endpointsList = [
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
const ACCEPTED_FILE_TYPES = ["image/", "video/", "application/pdf", "application/msword", "text/"];

function SortableMediaCard({ item, toggleActive, toggleFeatured, deleteMedia, setPreviewItem }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const renderPreview = (url) => {
    if (!url) return <span>Broken link</span>;
    const ext = url.split(".").pop().toLowerCase();
    if (["mp4", "webm", "ogg"].includes(ext)) return <video src={url} controls className="media-preview" />;
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return <img src={url} alt="preview" className="media-preview" />;
    return <a href={url} target="_blank" rel="noreferrer">Open File</a>;
  };

  return (
    <div ref={setNodeRef} style={style} className="media-card">
      <div className="media-card-header">
        <span className="drag-handle" {...attributes} {...listeners}>☰</span>
        <div onClick={() => setPreviewItem(item)} style={{ cursor: "pointer", flex: 1 }}>
          {renderPreview(item.url?.thumb || item.url?.full)}
        </div>
      </div>
      <p className="media-label"><strong>{item.label || "No Label"}</strong></p>
      <p className="media-meta">Uploaded by: {item.uploaded_by || "—"}</p>
      <p className="media-meta">Date: {new Date(item.uploaded_at).toLocaleString()}</p>
      <div className="media-actions">
        <p>Status: {item.is_active ? "✅ Active" : "❌ Inactive"}</p>
        {"is_featured" in item && <p>Featured: {item.is_featured ? "⭐ Yes" : "—"}</p>}
        <button onClick={() => toggleActive(item.id)}>{item.is_active ? "Deactivate" : "Activate"}</button>
        {"is_featured" in item && <button onClick={() => toggleFeatured(item.id)}>{item.is_featured ? "Unset Featured" : "Set as Featured"}</button>}
        <button onClick={() => deleteMedia(item.id)}>Delete</button>
      </div>
    </div>
  );
}

const MediaManagement = () => {
  const [mediaType, setMediaType] = useState("media"); // media | banner | featured
  const [selectedEndpoints, setSelectedEndpoints] = useState(["EethmHome"]);
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
      let res;
      if (mediaType === "featured") res = await mediaAPI.featured({ endpoint: selectedEndpoints[0] });
      else if (mediaType === "banner") res = await mediaAPI.banners({ endpoint: selectedEndpoints[0] });
      else res = await mediaAPI.all({ endpoint: selectedEndpoints[0] });

      const items = Array.isArray(res?.data) ? res.data : res?.data?.results ?? [];
      setUploadedItems(items);
    } catch (err) {
      console.error("fetchMedia error:", err);
      toast.error("Failed to load media.", { autoClose: 4000 });
    }
  }, [mediaType, selectedEndpoints]);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const invalidFiles = selected.filter(file => 
      !ACCEPTED_FILE_TYPES.some(type => file.type.startsWith(type)) || file.size > MAX_FILE_SIZE_MB * 1024 * 1024
    );
    if (invalidFiles.length) {
      invalidFiles.forEach(file => toast.warn(`${file.name} ${file.size > MAX_FILE_SIZE_MB*1024*1024 ? "exceeds 100MB" : "invalid type"}`, { autoClose: 5000 }));
      return;
    }
    setFiles(selected);
  };

  const handleUpload = async () => {
    if (!files.length) return toast.warn("Select at least one file.", { autoClose: 3000 });
    setUploading(true); setUploadProgress(0);

    try {
      await mediaAPI.upload(files, {
        type: mediaType,
        label: label || "Untitled",
        endpoint: selectedEndpoints,
        onUploadProgress: (progress) => setUploadProgress(progress),
      });
      setFiles([]); setLabel(""); fetchMedia();
      toast.success("Upload successful!", { autoClose: 3000 });
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || "Upload failed.";
      toast.error(msg, { autoClose: 5000 });
    } finally {
      setUploading(false); setUploadProgress(0);
    }
  };

  const toggleActive = async (id) => {
    try {
      const { data } = await mediaAPI.toggle(id);
      setUploadedItems(prev => prev.map(item => item.id === id ? { ...item, is_active: data.is_active } : item));
      toast.info(data.is_active ? "Activated." : "Deactivated.", { autoClose: 2500 });
    } catch { toast.error("Toggle failed.", { autoClose: 3000 }); }
  };

  const toggleFeatured = async (id) => {
    try {
      const { data } = await mediaAPI.toggleFeatured(id);
      setUploadedItems(prev => prev.map(item => item.id === id ? { ...item, is_featured: data.is_featured } : item));
      toast.info(data.is_featured ? "Marked as featured." : "Unmarked.", { autoClose: 2500 });
    } catch { toast.error("Feature toggle failed.", { autoClose: 3000 }); }
  };

  const deleteMedia = async (id) => {
    if (!window.confirm("Delete this media?")) return;
    try { await mediaAPI.delete(id); setUploadedItems(prev => prev.filter(item => item.id !== id)); toast.success("Media deleted.", { autoClose: 3000 }); }
    catch { toast.error("Deletion failed.", { autoClose: 3000 }); }
  };

  const handleDragEnd = async (event) => {
    if (mediaType !== "media") return; // Only media can be reordered
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = uploadedItems.findIndex(i => i.id === active.id);
    const newIndex = uploadedItems.findIndex(i => i.id === over.id);
    const reordered = arrayMove(uploadedItems, oldIndex, newIndex);
    setUploadedItems(reordered);

    try {
      const orderedIds = reordered.map((item, index) => ({ id: item.id, position: index }));
      await mediaAPI.reorder(orderedIds);
      toast.success("Order updated.", { autoClose: 2000 });
    } catch { toast.error("Reorder failed.", { autoClose: 3000 }); }
  };

  return (
    <div className="admin-dashboard-preview">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>Media Management ({mediaType})</h2>

      {/* Media type tabs */}
      <div className="media-type-tabs">
        <button className={mediaType === "media" ? "active" : ""} onClick={() => setMediaType("media")}>Media</button>
        <button className={mediaType === "banner" ? "active" : ""} onClick={() => setMediaType("banner")}>Banners</button>
        <button className={mediaType === "featured" ? "active" : ""} onClick={() => setMediaType("featured")}>Featured</button>
      </div>

      {/* Controls */}
      <div className="media-controls">
        <input type="file" multiple accept="image/*,video/*,application/pdf,application/msword,text/*" onChange={handleFileChange} />
        <input type="text" placeholder="Enter media label" value={label} onChange={(e) => setLabel(e.target.value)} />
        <input type="text" placeholder="Search media..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        {/* Endpoint selection always visible */}
        <select multiple value={selectedEndpoints} onChange={(e) => setSelectedEndpoints(Array.from(e.target.selectedOptions, opt => opt.value))}>
          {endpointsList.map(ep => <option key={ep.value} value={ep.value}>{ep.label}</option>)}
        </select>
        <button onClick={handleUpload} disabled={uploading || !files.length}>
          {uploading ? `Uploading ${uploadProgress}%...` : "Upload"}
        </button>
      </div>

      {/* Media list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={uploadedItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
          <div className="media-list">
            {uploadedItems
              .filter(item => item.label?.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(item => (
                <SortableMediaCard
                  key={item.id}
                  item={item}
                  toggleActive={toggleActive}
                  toggleFeatured={toggleFeatured}
                  deleteMedia={deleteMedia}
                  setPreviewItem={setPreviewItem}
                />
              ))
            }
          </div>
        </SortableContext>
      </DndContext>

      {/* Preview */}
      {previewItem && <div className="preview-overlay" onClick={() => setPreviewItem(null)}>
        <div className="preview-content" onClick={e => e.stopPropagation()}>
          <button onClick={() => setPreviewItem(null)} className="close-button">Close</button>
          <h3>Preview</h3>
          {(() => {
            const url = previewItem.url?.full || previewItem.url?.thumb;
            if (!url) return <span>No preview available</span>;
            const ext = url.split(".").pop().toLowerCase();
            if (["mp4", "webm", "ogg"].includes(ext)) return <video src={url} controls className="media-preview" />;
            return <img src={url} alt="preview" className="media-preview" />;
          })()}
        </div>
      </div>}
    </div>
  );
};

export default MediaManagement;
