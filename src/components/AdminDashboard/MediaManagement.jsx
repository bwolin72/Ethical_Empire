import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchMedia();
  }, [mediaType, selectedEndpoint, statusFilter]);

  const fetchMedia = async () => {
    try {
      const params = {
        type: mediaType,
        endpoint: selectedEndpoint,
      };
      if (statusFilter !== 'all') {
        params.is_active = statusFilter === 'active';
      }
      const res = await axiosInstance.get('/media/list/', { params });
      setUploadedItems(res.data);
    } catch (error) {
      console.error('Failed to fetch media:', error);
      toast.error('Failed to load media.');
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (!files.length) return toast.warn('Select at least one file.');

    setUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append('media', file));
    formData.append('type', mediaType);
    formData.append('endpoint', selectedEndpoint);

    try {
      await axiosInstance.post('/media/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchMedia();
      setFiles([]);
      toast.success('Upload successful!');
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (id) => {
    try {
      const res = await axiosInstance.patch(`/media/toggle/${id}/`);
      fetchMedia();
      toast.info(`Media is now ${res.data.is_active ? 'active' : 'inactive'}.`);
    } catch (err) {
      console.error('Toggle failed:', err);
      toast.error('Toggle failed.');
    }
  };

  const deleteMedia = async (id) => {
    if (!window.confirm('Delete this media?')) return;

    try {
      await axiosInstance.delete(`/media/delete/${id}/`);
      fetchMedia();
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
    return <a href={url} target="_blank" rel="noreferrer">Open File</a>;
  };

  return (
    <div className="admin-dashboard-preview">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>{mediaType === 'media' ? 'Media Uploads' : 'Banner Uploads'}</h2>

      <div className="media-controls">
        <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} />

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

        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>

        <button onClick={() => setMediaType(mediaType === 'media' ? 'banner' : 'media')}>
          Switch to {mediaType === 'media' ? 'Banner' : 'Media'}
        </button>
      </div>

      <div className="media-list">
        {uploadedItems.length === 0 && <p>No {mediaType}s found for this filter.</p>}
        {uploadedItems.map((item) => (
          <div className="media-card" key={item.id}>
            {renderPreview(item.url)}
            <div className="media-actions">
              <button onClick={() => toggleActive(item.id)}>
                {item.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => deleteMedia(item.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaManagement;
