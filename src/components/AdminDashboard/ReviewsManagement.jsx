import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './ReviewsManagement.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [replyMap, setReplyMap] = useState({});

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axiosInstance.get('/reviews/');
      setReviews(res.data);
    } catch (err) {
      toast.error('Failed to load reviews.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/reviews/${id}/delete/`);
      toast.success('Review deleted.');
      fetchReviews();
    } catch (err) {
      toast.error('Failed to delete review.');
    }
  };

  const handleReply = async (id) => {
    const reply = replyMap[id];
    if (!reply?.trim()) {
      toast.warning('Reply cannot be empty.');
      return;
    }
    try {
      await axiosInstance.patch(`/reviews/${id}/reply/`, { reply });
      toast.success('Reply sent.');
      setReplyMap((prev) => ({ ...prev, [id]: '' }));
      fetchReviews();
    } catch (err) {
      toast.error('Failed to send reply.');
    }
  };

  const handleReplyChange = (id, value) => {
    setReplyMap({ ...replyMap, [id]: value });
  };

  return (
    <div className="reviews-panel">
      <ToastContainer position="top-right" />
      <h2>Reviews Management</h2>
      {reviews.map((review) => (
        <div className="review-card" key={review.id}>
          <p className="review-message">"{review.message}"</p>
          <p className="review-author">— {review.reviewer_name}</p>

          {review.reply && (
            <p className="review-reply"><strong>Admin Reply:</strong> {review.reply}</p>
          )}

          <textarea
            placeholder="Type your reply..."
            value={replyMap[review.id] || ''}
            onChange={(e) => handleReplyChange(review.id, e.target.value)}
          />
          <div className="review-actions">
            <button onClick={() => handleReply(review.id)}>Reply</button>
            <button onClick={() => handleDelete(review.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewsManagement;
