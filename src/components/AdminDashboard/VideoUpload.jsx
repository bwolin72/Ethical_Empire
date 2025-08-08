import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
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
      <p><strong>{video.label}</strong></p>
      <p>
        Type: {video.type} | Active: {video.is_active ? '✅' : '❌'} | Featured: {video.is_featured ? '⭐' : '—'}
      </p>
      <div className="video-actions">
        <button onClick={() => onToggleActive(video.id)}>Toggle Active</button>
        <button onClick={() => onToggleFeatured(video.id)}>Toggle Featured</button>
        <button onClick={() => onPreview(video)}>Preview</button>
      </div>
    </div>
  );
};

/* ===== Admin Video Manager ===== */
const VideoManagerAdmin = () => {
  const [videos, setVideos] = useState([]);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [loading, setLoading] = useState(false);

  /* Fetch videos from API */
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/videos/');
      const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setVideos(data);
    } catch (err) {
      console.error('Failed to fetch videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  /* Toggle Active Status */
  const handleToggleActive = async (id) => {
    try {
      await axiosInstance.patch(`/videos/${id}/toggle_active/`);
      fetchVideos();
    } catch (err) {
      console.error('Toggle active failed:', err);
    }
  };

  /* Toggle Featured Status */
  const handleToggleFeatured = async (id) => {
    try {
      await axiosInstance.patch(`/videos/${id}/toggle_featured/`);
      fetchVideos();
    } catch (err) {
      console.error('Toggle featured failed:', err);
    }
  };

  /* Handle Drag-and-Drop Reorder */
  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = videos.findIndex((v) => v.id === active.id);
    const newIndex = videos.findIndex((v) => v.id === over.id);

    const reordered = arrayMove(videos, oldIndex, newIndex);
    setVideos(reordered);

    try {
      await axiosInstance.post('/videos/reorder/', {
        order: reordered.map((v) => v.id),
      });
    } catch (err) {
      console.error('Reorder failed:', err);
    }
  };

  if (!Array.isArray(videos)) {
    return <div className="error-message">⚠️ Invalid video data format.</div>;
  }

  return (
    <div className="video-admin-panel">
      <h2>📽️ Video Manager</h2>

      {loading && <p>Loading videos...</p>}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={videos.map((v) => v.id)} strategy={verticalListSortingStrategy}>
          {videos.map((video) => (
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
            <h3>{previewVideo.label}</h3>
            <video src={previewVideo.video_url || previewVideo.video} controls width="100%" />
            <button onClick={() => setPreviewVideo(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoManagerAdmin;
