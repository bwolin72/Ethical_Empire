import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import api from '../../api/videosAPI';
import './VideoUpload.css';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/* ===== Sortable Video Item ===== */
const SortableItem = ({ video, onToggleActive, onToggleFeatured, onPreview }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: '1px solid var(--color-border, #ccc)',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: '#fff',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <p><strong>{video.title}</strong></p>
      <p>
        Active: {video.is_active ? '✅' : '❌'} | Featured: {video.is_featured ? '⭐' : '—'}
      </p>
      <p>Endpoints: {video.endpoints_display?.join(', ') || '—'}</p>
      <div className="video-actions">
        <button onClick={() => onToggleActive(video.id)}>Toggle Active</button>
        <button onClick={() => onToggleFeatured(video.id)}>Toggle Featured</button>
        <button onClick={() => onPreview(video)}>Preview</button>
      </div>
    </div>
  );
};

/* ===== Admin Video Manager ===== */
const ENDPOINT_OPTIONS = [
  'EethmHome', 'UserPage', 'About', 'CateringServicePage',
  'LiveBandServicePage', 'DecorServicePage', 'MediaHostingServicePage',
  'VendorPage', 'PartnerPage', 'PartnerVendorDashboard'
];

const VideoManagerAdmin = () => {
  const [videos, setVideos] = useState([]);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Upload form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [selectedEndpoints, setSelectedEndpoints] = useState([]);

  const CLOUDINARY_UPLOAD_PRESET = 'your_unsigned_preset';
  const CLOUDINARY_CLOUD_NAME = 'your_cloud_name';

  // Fetch videos
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(api.videos.list);
      const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setVideos(data);
    } catch (err) {
      console.error('Failed to fetch videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVideos(); }, []);

  // Upload video
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title.trim() || selectedEndpoints.length === 0) {
      alert('Please fill in all fields and select at least one endpoint.');
      return;
    }

    setUploading(true);
    try {
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
        { method: 'POST', body: formData }
      );
      const cloudinaryData = await cloudinaryRes.json();

      if (!cloudinaryData.secure_url) throw new Error('Cloudinary upload failed');

      // Send to backend
      await axiosInstance.post(api.videos.create, {
        title,
        description,
        video_file: cloudinaryData.secure_url,
        endpoints: selectedEndpoints
      });

      setTitle('');
      setDescription('');
      setFile(null);
      setSelectedEndpoints([]);
      fetchVideos();
    } catch (err) {
      console.error('Video upload failed:', err);
      alert('Video upload failed.');
    } finally {
      setUploading(false);
    }
  };

  // Toggle Active / Featured
  const handleToggleActive = async (id) => { try { await axiosInstance.post(api.videos.toggleActive(id)); fetchVideos(); } catch (err) { console.error(err); } };
  const handleToggleFeatured = async (id) => { try { await axiosInstance.post(api.videos.toggleFeatured(id)); fetchVideos(); } catch (err) { console.error(err); } };

  // Drag & Drop
  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = videos.findIndex(v => v.id === active.id);
    const newIndex = videos.findIndex(v => v.id === over.id);
    setVideos(arrayMove(videos, oldIndex, newIndex));
  };

  return (
    <div className="video-admin-panel">
      <h2>📽️ Video Manager</h2>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="video-upload-form">
        <input type="text" placeholder="Video Title" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <input type="file" accept="video/*" onChange={e => setFile(e.target.files[0])} />
        <select multiple value={selectedEndpoints} onChange={e => setSelectedEndpoints(Array.from(e.target.selectedOptions, o => o.value))}>
          {ENDPOINT_OPTIONS.map(ep => <option key={ep} value={ep}>{ep}</option>)}
        </select>
        <button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload Video'}</button>
      </form>

      {loading && <p>Loading videos...</p>}

      {/* Video List */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={videos.map(v => v.id)} strategy={verticalListSortingStrategy}>
          {videos.map(video => (
            <SortableItem
              key={video.id}
              video={video}
              onToggleActive={handleToggleActive}
              onToggleFeatured={handleToggleFeatured}
              onPreview={setPreviewVideo}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Preview Modal */}
      {previewVideo && (
        <div className="video-modal">
          <div className="video-modal-content">
            <h3>{previewVideo.title}</h3>
            <video src={previewVideo.video_url || previewVideo.video_file} controls width="100%" />
            <button onClick={() => setPreviewVideo(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoManagerAdmin;
