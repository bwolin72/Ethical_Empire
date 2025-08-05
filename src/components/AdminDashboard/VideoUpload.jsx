import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './VideoUpload.css';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const ENDPOINT_OPTIONS = [
  'EethmHome', 'UserPage', 'About', 'CateringServicePage',
  'LiveBandServicePage', 'DecorServicePage', 'MediaHostingServicePage',
  'VendorPage', 'PartnerPage', 'AgencyDashboard',
];

const SortableItem = ({ video, index, onToggleActive, onToggleFeatured, onPreview }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: video.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: '#fff',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <p><strong>{video.label}</strong></p>
      <p>Type: {video.type} | Active: {video.is_active ? '✅' : '❌'} | Featured: {video.is_featured ? '⭐' : '—'}</p>
      <button onClick={() => onToggleActive(video.id)}>Toggle Active</button>
      <button onClick={() => onToggleFeatured(video.id)}>Toggle Featured</button>
      <button onClick={() => onPreview(video)}>Preview</button>
    </div>
  );
};

const VideoManagerAdmin = () => {
  const [videos, setVideos] = useState([]);
  const [previewVideo, setPreviewVideo] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await axiosInstance.get('/api/videos/');
      setVideos(res.data);
    } catch (err) {
      console.error('Failed to fetch videos:', err);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await axiosInstance.patch(`/api/videos/${id}/toggle_active/`);
      fetchVideos();
    } catch (err) {
      console.error('Toggle active failed:', err);
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await axiosInstance.patch(`/api/videos/${id}/toggle_featured/`);
      fetchVideos();
    } catch (err) {
      console.error('Toggle featured failed:', err);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = videos.findIndex((v) => v.id === active.id);
      const newIndex = videos.findIndex((v) => v.id === over?.id);
      const reordered = arrayMove(videos, oldIndex, newIndex);
      setVideos(reordered);

      // Optional: send new order to backend
      try {
        await axiosInstance.post('/api/videos/reorder/', {
          order: reordered.map((v) => v.id),
        });
      } catch (err) {
        console.error('Reorder failed:', err);
      }
    }
  };

  return (
    <div className="video-admin-panel">
      <h2>📽️ Video Manager</h2>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={videos.map((v) => v.id)} strategy={verticalListSortingStrategy}>
          {videos.map((video, index) => (
            <SortableItem
              key={video.id}
              video={video}
              index={index}
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
            <video
              src={previewVideo.video_url || previewVideo.video}
              controls
              width="100%"
            />
            <button onClick={() => setPreviewVideo(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoManagerAdmin;
