import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './VideoUpload.css';

const VideoUpload = () => {
  const [file, setFile] = useState(null);
  const [label, setLabel] = useState('');
  const [type, setType] = useState('media');
  const [endpoints, setEndpoints] = useState(['EethmHome']);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      return alert('Please select a file to upload');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('label', label);
    formData.append('type', type);
    endpoints.forEach(ep => formData.append('endpoints', ep));
    formData.append('is_active', isActive);
    formData.append('is_featured', isFeatured);

    try {
      await axiosInstance.post('/media/upload/', formData);
      setStatus('✅ Upload successful!');
    } catch (err) {
      console.error(err);
      setStatus('❌ Upload failed.');
    }
  };

  return (
    <div className="upload-form-container">
      <h2>Upload Video</h2>
      <form onSubmit={handleSubmit}>
        <label>Label:
          <input type="text" value={label} onChange={e => setLabel(e.target.value)} />
        </label>

        <label>File:
          <input type="file" accept="video/*" onChange={e => setFile(e.target.files[0])} />
        </label>

        <label>Type:
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="media">Media</option>
            <option value="banner">Banner</option>
          </select>
        </label>

        <label>Endpoint:
          <select value={endpoints[0]} onChange={e => setEndpoints([e.target.value])}>
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
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
          Active
        </label>

        <label>
          <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />
          Featured
        </label>

        <button type="submit">Upload</button>
        {status && <p>{status}</p>}
      </form>
    </div>
  );
};

export default VideoUpload;
