// src/components/AdminDashboard/BannerManagement.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './MediaManagement.css'; // reuse media styles

const BannerManagement = () => {
  const [files, setFiles] = useState([]);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await axiosInstance.get('/banners/');
      setBanners(res.data);
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    }
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    for (const file of files) {
      formData.append('media', file);
    }
    formData.append('type', 'banner');

    try {
      await axiosInstance.post('/banners/', formData);
      fetchBanners();
    } catch (err) {
      console.error('Banner upload failed:', err);
    }
  };

  const toggleActive = async (id) => {
    try {
      await axiosInstance.patch(`/banners/${id}/toggle/`);
      fetchBanners();
    } catch (err) {
      console.error('Toggle active failed:', err);
    }
  };

  const deleteBanner = async (id) => {
    try {
      await axiosInstance.delete(`/banners/${id}/`);
      fetchBanners();
    } catch (err) {
      console.error('Delete banner failed:', err);
    }
  };

  return (
    <div className="media-panel">
      <h2>Banner Uploads</h2>

      <div className="media-controls">
        <input type="file" multiple onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload Banner</button>
      </div>

      <div className="media-list">
        {banners.map((item) => (
          <div className="media-card" key={item.id}>
            <img src={item.url} alt={item.title || 'banner'} />
            <div className="media-actions">
              <button onClick={() => toggleActive(item.id)}>
                {item.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => deleteBanner(item.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BannerManagement;
