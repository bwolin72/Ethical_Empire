import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api'; // your centralized api service
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './PartnerProfilePage.css';

const PartnerProfilePage = () => {
  const [profile, setProfile] = useState({
    company_name: '',
    business_type: '',
    phone: '',
    country: '',
    website: '',
    message: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.getPartnerProfile();
        setProfile(res.data);
      } catch (error) {
        toast.error('Failed to fetch profile');
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(profile).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    try {
      await api.updatePartnerProfile(formData);
      toast.success('Profile updated successfully');
      navigate('/partner-dashboard'); // or '/agency-dashboard', adjust if needed
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="partner-page">
      <ToastContainer position="top-center" />
      <h2>Partner Profile</h2>
      <form onSubmit={handleSubmit} className="partner-form">
        <label>
          Company Name
          <input name="company_name" value={profile.company_name} onChange={handleChange} required />
        </label>
        <label>
          Business Type
          <input name="business_type" value={profile.business_type} onChange={handleChange} required />
        </label>
        <label>
          Phone Number
          <input name="phone" value={profile.phone} onChange={handleChange} required />
        </label>
        <label>
          Country
          <input name="country" value={profile.country} onChange={handleChange} required />
        </label>
        <label>
          Website / Portfolio
          <input name="website" value={profile.website} onChange={handleChange} />
        </label>
        <label>
          Message / Equipment Needed
          <textarea
            name="message"
            value={profile.message}
            onChange={handleChange}
            rows="4"
            required
          />
        </label>
        <label>
          Upload Image (optional)
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
        </label>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default PartnerProfilePage;
