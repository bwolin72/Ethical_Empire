import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './VideosManagement.css';

const VideosManagement = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/videos/');
      setVideos(res.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !title) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('video_file', selectedFile);

    try {
      setUploading(true);
      await axios.post('/api/videos/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTitle('');
      setSelectedFile(null);
      fetchVideos();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload media. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      await axios.post(`/api/videos/${id}/activate/`);
      fetchVideos();
    } catch (error) {
      console.error('Activate error:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/videos/${id}/`);
      fetchVideos();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const isVideo = (url) => {
    return /\.(mp4|webm|mov)$/i.test(url);
  };

  return (
    <div className="media-manager">
      <h2>Media Management</h2>

      <form className="upload-form" onSubmit={handleUpload}>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          required
        />
        <input
          type="text"
          placeholder="Enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {loading ? (
        <p>Loading media...</p>
      ) : videos.length === 0 ? (
        <p>No media available.</p>
      ) : (
        <div className="media-grid">
          {videos.map((media) => (
            <div className="media-card" key={media.id}>
              <h4>{media.title}</h4>
              {isVideo(media.video_file) ? (
                <video src={media.video_file} controls preload="metadata" />
              ) : (
                <img src={media.video_file} alt={media.title} />
              )}
              <div className="media-actions">
                <button
                  className={media.is_active ? 'active' : ''}
                  onClick={() => handleActivate(media.id)}
                >
                  {media.is_active ? 'Active' : 'Set Active'}
                </button>
                <button className="delete" onClick={() => handleDelete(media.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideosManagement;
