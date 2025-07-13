import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './MediaManagement.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const endpoints = [
  { label: 'Home', value: 'EethmHome' },
  { label: 'User Page', value: 'UserPage' },
  { label: 'About', value: 'About' },
  { label: 'Catering', value: 'CateringPage' },
  { label: 'Live Band', value: 'LiveBandServicePage' },
  { label: 'Decor', value: 'DecorPage' },
  { label: 'Media Hosting', value: 'MediaHostingServicePage' },
];

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_FILE_TYPES = ['image/', 'video/'];

const MediaManagement = () => {
  const [mediaType, setMediaType] = useState('media');
  const [selectedEndpoint, setSelectedEndpoint] = useState('EethmHome');
  const [statusFilter, setStatusFilter] = useState('all');
  const [files, setFiles] = useState([]);
  const [uploadedItems, setUploadedItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState(null);
  const [label, setLabel] = useState('');

  const fetchMedia = useCallback(async () => {
    try {
      const params = { type: mediaType };
      if (mediaType !== 'banner') params.endpoint = selectedEndpoint;
      if (statusFilter !== 'all') params.is_active = statusFilter === 'active';

      const res = await axiosInstance.get('/media/', { params });
      setUploadedItems(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch media:', error);
      toast.error('Failed to load media.', { autoClose: 4000 });
      setUploadedItems([]);
    }
  }, [mediaType, selectedEndpoint, statusFilter]);

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

    if (invalidFiles.length > 0) {
      invalidFiles.forEach((file) => {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          toast.warn(`${file.name} exceeds 10MB limit.`, { autoClose: 5000 });
        } else {
          toast.warn(`${file.name} is not a valid image/video.`, { autoClose: 5000 });
        }
      });
      return;
    }

    setFiles(selected);
  };

  const handleUpload = async () => {
    if (!files.length) return toast.warn('Select at least one file.', { autoClose: 3000 });

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach((file) => formData.append('media', file));
    formData.append('type', mediaType);
    formData.append('label', label || 'Untitled');
    if (mediaType !== 'banner') formData.append('endpoint', selectedEndpoint);

    try {
      await axiosInstance.post('/media/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

      fetchMedia();
      setFiles([]);
      setLabel('');
      toast.success('Upload successful!', { autoClose: 3000 });
    } catch (err) {
      console.error('Upload failed:', err);
      const msg = err?.response?.data?.detail || err?.response?.data?.message || err?.response?.data?.error || 'Upload failed. Try again.';
      toast.error(msg, { autoClose: 5000 });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const toggleActive = async (id) => {
    try {
      const res = await axiosInstance.patch(`/media/${id}/toggle/`);
      toast.info(res.data.is_active ? 'Activated.' : 'Deactivated.', { autoClose: 2500 });
      setUploadedItems((prev) => prev.map((item) => (item.id === id ? { ...item, is_active: res.data.is_active } : item)));
    } catch (err) {
      toast.error('Toggle failed.', { autoClose: 3000 });
    }
  };

  const toggleFeatured = async (id) => {
    try {
      const res = await axiosInstance.patch(`/media/${id}/toggle/featured/`);
      toast.info(res.data.is_featured ? 'Marked as featured.' : 'Unmarked as featured.', { autoClose: 2500 });
      setUploadedItems((prev) => prev.map((item) => (item.id === id ? { ...item, is_featured: res.data.is_featured } : item)));
    } catch (err) {
      toast.error('Feature toggle failed.', { autoClose: 3000 });
    }
  };

  const deleteMedia = async (id) => {
    if (!window.confirm('Delete this media?')) return;

    try {
      await axiosInstance.delete(`/media/${id}/delete/`);
      setUploadedItems((prev) => prev.filter((item) => item.id !== id));
      toast.success('Media deleted.', { autoClose: 3000 });
    } catch (err) {
      toast.error('Deletion failed.', { autoClose: 3000 });
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reordered = Array.from(uploadedItems);
    const [movedItem] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, movedItem);

    setUploadedItems(reordered);

    try {
      const orderedIds = reordered.map((item, index) => ({ id: item.id, position: index }));
      await axiosInstance.post('/media/reorder/', { items: orderedIds });
      toast.success('Order updated.', { autoClose: 2000 });
    } catch (error) {
      console.error('Reorder failed:', error);
      toast.error('Reorder failed.', { autoClose: 3000 });
    }
  };

  const renderPreview = (url) => {
    const ext = url.split('.').pop().toLowerCase();
    if (['mp4', 'webm'].includes(ext)) return <video src={url} controls className="media-preview" />;
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return <img src={url} alt="preview" className="media-preview" />;
    return <a href={url} target="_blank" rel="noreferrer">Open File</a>;
  };

  return (
    <div className="admin-dashboard-preview">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>{mediaType === 'media' ? 'Media Uploads' : mediaType === 'banner' ? 'Banner Uploads' : 'Featured Media'}</h2>

      <div className="media-controls">
        <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} />

        <input type="text" placeholder="Enter media label (e.g., Hero Banner)" value={label} onChange={(e) => setLabel(e.target.value)} />

        <select value={selectedEndpoint} onChange={(e) => setSelectedEndpoint(e.target.value)}>
          {endpoints.map((ep) => (
            <option key={ep.value} value={ep.value}>{ep.label}</option>
          ))}
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button onClick={handleUpload} disabled={uploading || files.length === 0}>
          {uploading ? `Uploading ${uploadProgress}%...` : 'Upload'}
        </button>

        <button onClick={() => setMediaType((prev) => prev === 'media' ? 'banner' : prev === 'banner' ? 'featured' : 'media')}>
          Switch to {mediaType === 'media' ? 'Banner' : mediaType === 'banner' ? 'Featured' : 'Media'}
        </button>
      </div>

      <div className="media-search-bar">
        <input type="text" placeholder="Search media by URL..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {uploading && (
        <div className="upload-progress">
          <p>Uploading: {uploadProgress}%</p>
          <progress value={uploadProgress} max="100" />
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="media-list">
          {(provided) => (
            <div className="media-list" ref={provided.innerRef} {...provided.droppableProps}>
              {uploadedItems.length === 0 && <p>No {mediaType}s found for this filter.</p>}
              {uploadedItems.filter((item) => item.url?.toLowerCase().includes(searchQuery.toLowerCase())).map((item, index) => (
                <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                  {(provided) => (
                    <div className="media-card" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <div onClick={() => setPreviewItem(item)} style={{ cursor: 'pointer' }}>
                        {renderPreview(item.url)}
                      </div>
                      <p className="media-label"><strong>{item.label || 'No Label'}</strong></p>
                      <div className="media-actions">
                        <p>Status: {item.is_active ? '✅ Active' : '❌ Inactive'}</p>
                        {'is_featured' in item && <p>Featured: {item.is_featured ? '⭐ Yes' : '—'}</p>}
                        <button onClick={() => toggleActive(item.id)}>{item.is_active ? 'Deactivate' : 'Activate'}</button>
                        {'is_featured' in item && <button onClick={() => toggleFeatured(item.id)}>{item.is_featured ? 'Unset Featured' : 'Set as Featured'}</button>}
                        <button onClick={() => deleteMedia(item.id)}>Delete</button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {previewItem && (
        <div className="preview-overlay" onClick={() => setPreviewItem(null)}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewItem(null)} className="close-button">Close</button>
            <h3>Preview</h3>
            {renderPreview(previewItem.url)}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaManagement;
