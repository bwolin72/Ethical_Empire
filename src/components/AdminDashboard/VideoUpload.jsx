import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './VideoUpload.css';

const VideoUpload = ({ videoId = null, existingData = null }) => {
  const [files, setFiles] = useState([]);
  const [label, setLabel] = useState('');
  const [type, setType] = useState('media');
  const [endpoints, setEndpoints] = useState(['EethmHome']);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState(null);
  const isUpdating = !!videoId;

  useEffect(() => {
    if (existingData) {
      setLabel(existingData.label || '');
      setType(existingData.type || 'media');
      setEndpoints(existingData.endpoints || ['EethmHome']);
      setIsActive(existingData.is_active ?? true);
      setIsFeatured(existingData.is_featured ?? false);
    }
  }, [existingData]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setStatus(null); // Reset status

    if (!files.length && !isUpdating) {
      setStatus('❌ Please select at least one video file.');
      return;
    }

    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    if (files.length && !files.every(file => validTypes.includes(file.type))) {
      setStatus('❌ Invalid file type. Only MP4, MOV, or AVI files are allowed.');
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('media', file);
    });

    formData.append('label', label);
    formData.append('type', type);
    formData.append('endpoints', JSON.stringify(endpoints));
    formData.append('is_active', isActive.toString());
    formData.append('is_featured', isFeatured.toString());

    try {
      let response;
      if (isUpdating) {
        response = await axiosInstance.patch(`/media/upload/${videoId}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setStatus('✅ Video updated successfully!');
      } else {
        response = await axiosInstance.post('/media/upload/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setStatus('✅ Video uploaded successfully!');
      }

      console.log('[Success]', response.data);

      // Reset form
      setFiles([]);
      setLabel('');
      setType('media');
      setEndpoints(['EethmHome']);
      setIsActive(true);
      setIsFeatured(false);
    } catch (error) {
      console.error('[Error]', error?.response?.data || error.message);
      const detail =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        '❌ Request failed.';
      setStatus(detail);
    }
  };

  return (
    <div className="upload-form-container">
      <h2>{isUpdating ? 'Update Video' : 'Upload Video'}</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="label">Label:</label>
        <input
          id="label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
        />

        <label htmlFor="fileUpload">File(s):</label>
        <input
          id="fileUpload"
          type="file"
          accept="video/*"
          multiple
          onChange={handleFileChange}
          required={!isUpdating}
        />

        {files.length > 0 && (
          <ul className="file-preview-list">
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        )}

        <label htmlFor="type">Type:</label>
        <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="media">Media</option>
          <option value="banner">Banner</option>
        </select>

        <label htmlFor="endpoints">Endpoints:</label>
        <select
          id="endpoints"
          multiple
          value={endpoints}
          onChange={(e) =>
            setEndpoints(Array.from(e.target.selectedOptions, (opt) => opt.value))
          }
        >
          <option value="EethmHome">EethmHome</option>
          <option value="UserPage">UserPage</option>
          <option value="About">About</option>
          <option value="CateringPage">CateringPage</option>
          <option value="LiveBandServicePage">Live Band</option>
          <option value="DecorPage">Decor</option>
          <option value="MediaHostingServicePage">Media Hosting</option>
          <option value="VendorPage">Vendor Page</option>
          <option value="PartnerPage">Partner Page</option>
        </select>

        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active
          </label>

          <label>
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            Featured
          </label>
        </div>

        <button type="submit">{isUpdating ? 'Update' : 'Upload'}</button>

        {status && <p className="upload-status">{status}</p>}
      </form>
    </div>
  );
};

export default VideoUpload;
