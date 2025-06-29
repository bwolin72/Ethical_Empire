import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './PromotionAdminPage.module.css';

const PromotionAdminPage = () => {
  const [title, setTitle] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [dismissible, setDismissible] = useState(true);
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await axiosInstance.get('/api/promotions/');
      setPromotions(res.data);
    } catch (error) {
      toast.error('❌ Failed to fetch promotions');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !htmlContent || !startTime || !endTime) {
      toast.warn('⚠️ All fields are required');
      return;
    }

    try {
      const res = await axiosInstance.post('/api/promotions/', {
        title,
        html_content: htmlContent,
        start_time: startTime,
        end_time: endTime,
        dismissible,
      });
      toast.success('✅ Promotion created');
      setTitle('');
      setHtmlContent('');
      setStartTime('');
      setEndTime('');
      setDismissible(true);
      fetchPromotions();
    } catch (error) {
      toast.error('❌ Failed to create promotion');
    }
  };

  return (
    <div className={styles.promoContainer}>
      <h2>Create Promotion</h2>
      <form onSubmit={handleSubmit} className={styles.promoForm}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="HTML Content"
          value={htmlContent}
          onChange={(e) => setHtmlContent(e.target.value)}
          rows={6}
          required
        />
        <label>
          Start Time:
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </label>
        <label>
          End Time:
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={dismissible}
            onChange={() => setDismissible(!dismissible)}
          />
          Dismissible by user
        </label>
        <button type="submit">Create Promotion</button>
      </form>

      <h3>Existing Promotions</h3>
      <ul className={styles.promoList}>
        {promotions.map((promo) => (
          <li key={promo.id}>
            <strong>{promo.title}</strong> — {promo.start_time} to {promo.end_time}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PromotionAdminPage;
