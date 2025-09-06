// src/pages/admin/MediaManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import mediaService from '../../api/services/mediaService'; // ✅ fixed import
import './MediaManagement.css';

const endpoints = [
  { label: 'Home', value: 'home' },
  { label: 'User Page', value: 'user' },
  { label: 'About', value: 'about' },
  { label: 'Catering', value: 'catering' },
  { label: 'Live Band', value: 'liveBand' },
  { label: 'Decor', value: 'decor' },
  { label: 'Media Hosting', value: 'mediaHosting' },
  { label: 'Vendor', value: 'vendor' },
  { label: 'Partner', value: 'partner' },
];

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_FILE_TYPES = ['image/', 'video/'];

function SortableMediaCard({ item, toggleActive, toggleFeatured, deleteMedia, setPreviewItem }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const renderPreview = (url) => {
    if (!url) return <span>Broken link</span>;
    const ext = url.split('.').pop().toLowerCase();
    if (['mp4', 'webm'].includes(ext)) return <video src={url} controls className="media-preview" />;
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return <img src={url} alt="preview" className="media-preview" />;
    return <a href={url} target="_blank" rel="noreferrer">Open File</a>;
  };

  return (
    <div ref={setNodeRef} style={style} className="media-card">
      <div className="media-card-header">
        <span className="drag-handle" {...attributes} {...listeners}>☰</span>
        <div onClick={() => setPreviewItem(item)} style={{ cursor: 'pointer', flex: 1 }}>
          {renderPreview(item.url?.thumb || item.url?.full)}
        </div>
      </div>
      <p className="media-label"><strong>{item.label || 'No Label'}</strong></p>
      <p className="media-meta">Uploaded by: {item.uploaded_by || '—'}</p>
      <p className="media-meta">Date: {new Date(item.uploaded_at).toLocaleString()}</p>
      <div className="media-actions">
        <p>Status: {item.is_active ? '✅ Active' : '❌ Inactive'}</p>
        {'is_featured' in item && <p>Featured: {item.is_featured ? '⭐ Yes' : '—'}</p>}
        <button onClick={() => toggleActive(item.id)}>{item.is_active ? 'Deactivate' : 'Activate'}</button>
        {'is_featured' in item && <button onClick={() => toggleFeatured(item.id)}>{item.is_featured ? 'Unset Featured' : 'Set as Featured'}</button>}
        <button onClick={() => deleteMedia(item.id)}>Delete</button>
      </div>
    </div>
  );
}

const MediaManagement = () => {
  const [mediaType, setMediaType] = useState('media');
  const [selectedEndpoints, setSelectedEndpoints] = useState(['home']);
  const [statusFilter, setStatusFilter] = useState('all');
  const [files, setFiles] = useState([]);
  const [uploadedItems, setUploadedItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState(null);
  const [label, setLabel] = useState('');

  const sensors = useSensors(useSensor(PointerSensor));

  const fetchMedia = useCallback(async () => {
    try {
      let res;
      const endpoint = selectedEndpoints[0];

      if (mediaType === 'featured') {
        res = await mediaService.getFeaturedMedia();
      } else if (mediaType === 'banner') {
        res = await mediaService.getBanners();
      } else {
        res = await mediaService.byEndpoint(endpoint);
      }

      // ✅ fixed response handling
      setUploadedItems(Array.isArray(res) ? res : []);
    } catch {
      toast.error('Failed to load media.', { autoClose: 4000 });
      setUploadedItems([]);
    }
  }, [mediaType, selectedEndpoints]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = async () => {
    if (!files.length) return toast.warn('Select at least one file.', { autoClose: 3000 });
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach((file) => formData.append('media', file));
    formData.append('type', mediaType);
    formData.append('label', label || 'Untitled');
    selectedEndpoints.forEach((ep) => formData.append('endpoint', ep));

    try {
      await mediaService.uploadMedia(formData);
      fetchMedia();
      setFiles([]);
      setLabel('');
      toast.success('Upload successful!', { autoClose: 3000 });
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || 'Upload failed. Try again.';
      toast.error(msg, { autoClose: 5000 });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const invalidFiles = selected.filter(
      (file) =>
        !ACCEPTED_FILE_TYPES.some((type) => file.type.startsWith(type)) ||
        file.size > MAX_FILE_SIZE_MB * 1024 * 1024
    );

    if (invalidFiles.length > 0) {
      invalidFiles.forEach((file) => {
        const reason = file.size > MAX_FILE_SIZE_MB * 1024 * 1024 ? 'exceeds 10MB limit' : 'not a valid image/video';
        toast.warn(`${file.name} ${reason}.`, { autoClose: 5000 });
      });
      return;
    }

    setFiles(selected);
  };

  // ✅ updated toggle calls
  const toggleActive = async (id) => {
    try {
      const res = await mediaService.toggleActive(id);
      toast.info(res.is_active ? 'Activated.' : 'Deactivated.', { autoClose: 2500 });
      setUploadedItems((prev) => prev.map((item) => (item.id === id ? { ...item, is_active: res.is_active } : item)));
    } catch {
      toast.error('Toggle failed.', { autoClose: 3000 });
    }
  };

  const toggleFeatured = async (id) => {
    try {
      const res = await mediaService.toggleFeatured(id);
      toast.info(res.is_featured ? 'Marked as featured.' : 'Unmarked.', { autoClose: 2500 });
      setUploadedItems((prev) => prev.map((item) => (item.id === id ? { ...item, is_featured: res.is_featured } : item)));
    } catch {
      toast.error('Feature toggle failed.', { autoClose: 3000 });
    }
  };

  const deleteMedia = async (id) => {
    if (!window.confirm('Delete this media?')) return;
    try {
      await mediaService.deleteMedia(id);
      setUploadedItems((prev) => prev.filter((item) => item.id !== id));
      toast.success('Media deleted.', { autoClose: 3000 });
    } catch {
      toast.error('Deletion failed.', { autoClose: 3000 });
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
      const orderedIds = reordered.map((item, index) => ({ id: item.id, position: index }));
      await mediaService.reorderMedia(orderedIds);
      toast.success('Order updated.', { autoClose: 2000 });
    } catch {
      toast.error('Reorder failed.', { autoClose: 3000 });
    }
  };

  return (
    <div className="admin-dashboard-preview">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>{mediaType === 'media' ? 'Media Uploads' : mediaType === 'banner' ? 'Banner Uploads' : 'Featured Media'}</h2>

      {/* Controls */}
      <div className="media-controls">
        <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} />
        <input type="text" placeholder="Enter media label" value={label} onChange={(e) => setLabel(e.target.value)} />
        <input type="text" placeholder="Search media..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <select multiple value={selectedEndpoints} onChange={(e) => setSelectedEndpoints(Array.from(e.target.selectedOptions, opt => opt.value))}>
          {endpoints.map((ep) => <option key={ep.value} value={ep.value}>{ep.label}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button onClick={handleUpload} disabled={uploading || files.length === 0}>
          {uploading ? `Uploading ${uploadProgress}%...` : 'Upload'}
        </button>
        <button onClick={() =>
          setMediaType((prev) =>
            prev === 'media' ? 'banner' : prev === 'banner' ? 'featured' : 'media'
          )
        }>
          Switch to {mediaType === 'media' ? 'Banner' : mediaType === 'banner' ? 'Featured' : 'Media'}
        </button>
      </div>

      {/* List */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={uploadedItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="media-list">
            {uploadedItems.length === 0 && <p>No media found.</p>}
            {uploadedItems
              .filter((item) =>
                item.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.url?.full?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((item) => (
                <SortableMediaCard
                  key={item.id}
                  item={item}
                  toggleActive={toggleActive}
                  toggleFeatured={toggleFeatured}
                  deleteMedia={deleteMedia}
                  setPreviewItem={setPreviewItem}
                />
              ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Preview Overlay */}
      {previewItem && (
        <div className="preview-overlay" onClick={() => setPreviewItem(null)}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewItem(null)} className="close-button">Close</button>
            <h3>Preview</h3>
            <img src={previewItem.url?.full} alt="preview" className="media-preview" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaManagement;
