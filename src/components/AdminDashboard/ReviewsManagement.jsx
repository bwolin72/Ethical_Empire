// src/components/admin/ReviewsManagement.jsx
import React, { useEffect, useState } from "react";
import reviewService from "../../api/services/reviewService";
import "./ReviewsManagement.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [replyMap, setReplyMap] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch all reviews on mount
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const toastId = toast.loading("Loading reviews...");
    setLoading(true);
    try {
      const res = await reviewService.getAllReviewsAdmin(); // Matches ReviewAdminListAPIView
      const reviewsData = Array.isArray(res.data) ? res.data : [];
      setReviews(reviewsData);

      toast.update(toastId, {
        render: "✅ Reviews loaded",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    } catch (err) {
      console.error("❌ Failed to fetch reviews:", err);
      toast.update(toastId, {
        render: "❌ Failed to load reviews",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    const toastId = toast.loading("Approving review...");
    try {
      await reviewService.approveReview(id); // Matches ReviewApprovalAPIView
      toast.update(toastId, {
        render: "✅ Review approved",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      fetchReviews();
    } catch (err) {
      console.error("❌ Failed to approve review:", err);
      toast.update(toastId, {
        render: "❌ Failed to approve review",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  const handleReply = async (id) => {
    const replyText = replyMap[id];
    if (!replyText || !replyText.trim()) {
      toast.warning("⚠️ Reply cannot be empty.");
      return;
    }
    const toastId = toast.loading("Sending reply...");
    try {
      await reviewService.replyToReview(id, { reply: replyText }); // Matches ReviewReplyAPIView
      toast.update(toastId, {
        render: "✅ Reply sent",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      setReplyMap((prev) => ({ ...prev, [id]: "" }));
      fetchReviews();
    } catch (err) {
      console.error("❌ Failed to send reply:", err);
      toast.update(toastId, {
        render: "❌ Failed to send reply",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  const handleDelete = async (id) => {
    const toastId = toast.loading("Deleting review...");
    try {
      await reviewService.deleteReview(id); // Matches ReviewDeleteAPIView
      toast.update(toastId, {
        render: "🗑️ Review deleted",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      fetchReviews();
    } catch (err) {
      console.error("❌ Failed to delete review:", err);
      toast.update(toastId, {
        render: "❌ Failed to delete review",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  const handleReplyChange = (id, value) => {
    setReplyMap((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="reviews-panel">
      <ToastContainer position="top-right" autoClose={2000} />
      <h2>Reviews Management</h2>

      {loading ? (
        <p className="review-message">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="review-message">No reviews available.</p>
      ) : (
        reviews.map((r) => (
          <div className="review-card" key={r.id}>
            <p><strong>Service:</strong> {r.service_display || r.service}</p>
            <p><strong>Rating:</strong> {r.rating} ⭐</p>
            <p><strong>Comment:</strong> "{r.comment}"</p>
            <p className="review-author"><strong>By:</strong> {r.user_email}</p>
            <p><strong>Submitted:</strong> {new Date(r.created_at).toLocaleString()}</p>
            <p><strong>Status:</strong> {r.approved ? "✅ Approved" : "❌ Pending"}</p>

            {r.reply && <p className="review-reply"><strong>Admin Reply:</strong> {r.reply}</p>}

            {!r.approved && (
              <button className="approve-btn" onClick={() => handleApprove(r.id)}>
                ✅ Approve
              </button>
            )}

            <textarea
              placeholder="Type your reply..."
              value={replyMap[r.id] || ""}
              onChange={(e) => handleReplyChange(r.id, e.target.value)}
            />

            <div className="review-actions">
              <button onClick={() => handleReply(r.id)}>💬 Reply</button>
              <button onClick={() => handleDelete(r.id)}>🗑️ Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ReviewsManagement;
