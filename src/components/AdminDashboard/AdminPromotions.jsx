import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import api from '../../api/api';
import './AdminPromotions.css';

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    html_content: '',
    start_time: '',
    end_time: '',
    dismissible: true,
  });
  const [editId, setEditId] = useState(null);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await axiosInstance.get(api.promotions.list);
        const data = res.data?.results || res.data; // handle pagination or direct list
        setPromotions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('[AdminPromotions] Fetch error:', err);
      }
    };
    fetchPromotions();
  }, [refresh]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axiosInstance.put(api.promotions.update(editId), formData);
      } else {
        await axiosInstance.post(api.promotions.create, formData);
      }
      resetForm();
      setRefresh((r) => !r);
    } catch (err) {
      console.error('[AdminPromotions] Submit error:', err);
    }
  };

  const handleEdit = (promo) => {
    setFormData({
      title: promo.title,
      html_content: promo.html_content,
      start_time: promo.start_time,
      end_time: promo.end_time,
      dismissible: promo.dismissible,
    });
    setEditId(promo.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this promotion?')) return;
    try {
      await axiosInstance.delete(api.promotions.delete(id));
      setRefresh((r) => !r);
    } catch (err) {
      console.error('[AdminPromotions] Delete error:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      html_content: '',
      start_time: '',
      end_time: '',
      dismissible: true,
    });
    setEditId(null);
  };

  return (
    <div className="admin-promotions">
      <h2>{editId ? 'Edit Promotion' : 'Create New Promotion'}</h2>
      <form className="promo-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Promotion Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="html_content"
          placeholder="HTML Content"
          value={formData.html_content}
          onChange={handleChange}
          rows="5"
        />
        <label>
          Start Time:
          <input
            type="datetime-local"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          End Time:
          <input
            type="datetime-local"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            required
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            name="dismissible"
            checked={formData.dismissible}
            onChange={handleChange}
          />
          Dismissible Popup
        </label>
        <button type="submit">{editId ? 'Update' : 'Post'} Promotion</button>
        {editId && <button type="button" onClick={resetForm}>Cancel Edit</button>}
      </form>

      <h3>All Promotions</h3>
      <div className="promo-list">
        {promotions.map((promo) => (
          <div key={promo.id} className="promo-card">
            <h4>{promo.title}</h4>
            <div className="promo-time">
              {new Date(promo.start_time).toLocaleString()} → {new Date(promo.end_time).toLocaleString()}
            </div>
            <div
              className="promo-preview"
              dangerouslySetInnerHTML={{ __html: promo.html_content }}
            />
            <div className="promo-meta">
              <span>{promo.dismissible ? 'Dismissible' : 'Fixed'}</span>
              <span className={`status ${promo.status?.toLowerCase() || ''}`}>
                {promo.status || 'Unknown'}
              </span>
            </div>
            <div className="promo-actions">
              <button onClick={() => handleEdit(promo)}>Edit</button>
              <button onClick={() => handleDelete(promo.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPromotions;
