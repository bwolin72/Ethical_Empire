import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './VideoUpload.css';

const VideoUpload = () => {
  const [files, setFiles] = useState([]);
  const [label, setLabel] = useState('');
  const [type, setType] = useState('media');
  const [endpoints, setEndpoints] = useState(['EethmHome']);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!files.length) {
      alert('Please select at least one video file.');
      return;
    }

    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    if (!files.every(file => validTypes.includes(file.type))) {
      alert('❌ Invalid file type. Only MP4, MOV, or AVI files are allowed.');
      return;
    }

    const formData = new FormData();

    files.forEach((file) => {
      formData.append('media', file);
    });

    formData.append('label', label);
    formData.append('type', type);

    endpoints.forEach((ep) => {
      formData.append('endpoint', ep);
    });

    formData.append('is_active', isActive.toString());
    formData.append('is_featured', isFeatured.toString());

    try {
      const response = await axiosInstance.post('/media/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('[Upload Success]', response.data);
      setStatus('✅ Upload successful!');

      // Reset form
      setFiles([]);
      setLabel('');
      setType('media');
      setEndpoints(['EethmHome']);
      setIsActive(true);
      setIsFeatured(false);
    } catch (error) {
      console.error('[Upload Error]', error?.response?.data || error.message);
      const detail =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        '❌ Upload failed.';
      setStatus(detail);
    }
  };

  return (
    <div className="upload-form-container">
      <h2>Upload Video</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Label:
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
          />
        </label>

        <label>
          File(s):
          <input
            type="file"
            accept="video/*"
            multiple
            onChange={(e) => setFiles([...e.target.files])}
            required
          />
        </label>

        {files.length > 0 && (
          <ul>
            {files.map((file, idx) => (
              <li key={idx}>{file.name}</li>
            ))}
          </ul>
        )}

        <label>
          Type:
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="media">Media</option>
            <option value="banner">Banner</option>
          </select>
        </label>

        <label>
          Endpoints:
          <select
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
          </select>
        </label>

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

        <button type="submit">Upload</button>
        {status && <p className="upload-status">{status}</p>}
      </form>
    </div>
  );
};

export default VideoUpload;
