import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './MediaManagement.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const endpoints = [
  { label: 'Home', value: 'EethmHome' },
  { label: 'User Page', value: 'UserPage' },
  { label: 'About', value: 'About' },
  { label: 'Catering', value: 'CateringPage' },
  { label: 'Live Band', value: 'LiveBandServicePage' },
  { label: 'Decor', value: 'DecorPage' },
  { label: 'Media Hosting', value: 'MediaHostingServicePage' },
];

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

  const fetchMedia = useCallback(async () => {
    try {
      const params = {
        type: mediaType,
        endpoint: selectedEndpoint,
      };
      if (statusFilter !== 'all') {
        params.is_active = statusFilter === 'active';
      }

      const res = await axiosInstance.get('/media/', { params });
      setUploadedItems(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch media:', error);
      toast.error('Failed to load media.');
      setUploadedItems([]); // fallback to empty
    }
  }, [mediaType, selectedEndpoint, statusFilter]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (!files.length) return toast.warn('Select at least one file.');

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach((file) => formData.append('media', file));
    formData.append('type', mediaType);
    formData.append('endpoint', selectedEndpoint);

    try {
      await axiosInstance.post('/media/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

      fetchMedia();
      setFiles([]);
      toast.success('Upload successful!');
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Upload failed. Try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const toggleActive = async (id) => {
    try {
      const res = await axiosInstance.patch(`/media/${id}/toggle/`);
      toast.info(res.data.is_active ? 'Activated.' : 'Deactivated.');
      setUploadedItems((prev) =>
        Array.isArray(prev)
          ? prev.map((item) =>
              item.id === id ? { ...item, is_active: res.data.is_active } : item
            )
          : []
      );
    } catch (err) {
      console.error('Toggle failed:', err);
      toast.error('Toggle failed.');
    }
  };

  const toggleFeatured = async (id) => {
    try {
      const res = await axiosInstance.patch(`/media/${id}/toggle/featured/`);
      toast.info(res.data.is_featured ? 'Marked as featured.' : 'Unmarked as featured.');
      setUploadedItems((prev) =>
        Array.isArray(prev)
          ? prev.map((item) =>
              item.id === id ? { ...item, is_featured: res.data.is_featured } : item
            )
          : []
      );
    } catch (err) {
      console.error('Feature toggle failed:', err);
      toast.error('Feature toggle failed.');
    }
  };

  const deleteMedia = async (id) => {
    if (!window.confirm('Delete this media?')) return;

    try {
      await axiosInstance.delete(`/media/${id}/delete/`);
      setUploadedItems((prev) => (Array.isArray(prev) ? prev.filter((item) => item.id !== id) : []));
      toast.success('Media deleted.');
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Deletion failed.');
    }
  };

  const renderPreview = (url) => {
    const ext = url.split('.').pop().toLowerCase();
    if (['mp4', 'webm'].includes(ext)) {
      return <video src={url} controls className="media-preview" />;
    }
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      return <img src={url} alt="preview" className="media-preview" />;
    }
    return (
      <a href={url} target="_blank" rel="noreferrer">
        Open File
      </a>
    );
  };

  return (
    <div className="admin-dashboard-preview">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>{mediaType === 'media' ? 'Media Uploads' : mediaType === 'banner' ? 'Banner Uploads' : 'Featured Media'}</h2>

      <div className="media-controls">
        <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} />

        <select value={selectedEndpoint} onChange={(e) => setSelectedEndpoint(e.target.value)}>
          {endpoints.map((ep) => (
            <option key={ep.value} value={ep.value}>
              {ep.label}
            </option>
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

        <button
          onClick={() => {
            setMediaType((prev) =>
              prev === 'media' ? 'banner' : prev === 'banner' ? 'featured' : 'media'
            );
          }}
        >
          Switch to {mediaType === 'media' ? 'Banner' : mediaType === 'banner' ? 'Featured' : 'Media'}
        </button>
      </div>

      <div className="media-search-bar">
        <input
          type="text"
          placeholder="Search media by URL..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {uploading && (
        <div className="upload-progress">
          <p>Uploading: {uploadProgress}%</p>
          <progress value={uploadProgress} max="100" />
        </div>
      )}

      <div className="media-list">
        {Array.isArray(uploadedItems) && uploadedItems.length === 0 && (
          <p>No {mediaType}s found for this filter.</p>
        )}
        {Array.isArray(uploadedItems) &&
          uploadedItems
            .filter((item) =>
              item.url?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((item) => (
              <div className="media-card" key={item.id}>
                <div onClick={() => setPreviewItem(item)} style={{ cursor: 'pointer' }}>
                  {renderPreview(item.url)}
                </div>
                <div className="media-actions">
                  <p>Status: {item.is_active ? '✅ Active' : '❌ Inactive'}</p>
                  {'is_featured' in item && (
                    <p>Featured: {item.is_featured ? '⭐ Yes' : '—'}</p>
                  )}
                  <button onClick={() => toggleActive(item.id)}>
                    {item.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  {'is_featured' in item && (
                    <button onClick={() => toggleFeatured(item.id)}>
                      {item.is_featured ? 'Unset Featured' : 'Set as Featured'}
                    </button>
                  )}
                  <button onClick={() => deleteMedia(item.id)}>Delete</button>
                </div>
              </div>
            ))}
      </div>

      {previewItem && (
        <div className="preview-overlay" onClick={() => setPreviewItem(null)}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewItem(null)} className="close-button">
              Close
            </button>
            <h3>Preview</h3>
            {renderPreview(previewItem.url)}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaManagement;
