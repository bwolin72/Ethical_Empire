// src/components/admin/ReviewsManagement.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import reviewsAPI from "../../api/reviewsAPI"; // ✅ API config
import "./ReviewsManagement.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [replyMap, setReplyMap] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  // === Fetch Reviews ===
  const fetchReviews = async () => {
    const toastId = toast.loading("Loading reviews...");
    setLoading(true);
    try {
      const res = await axiosInstance.get(reviewsAPI.adminList);
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.results)
        ? res.data.results
        : [];
      setReviews(data);

      toast.update(toastId, {
        render: "✅ Reviews loaded",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    } catch (error) {
      console.error("❌ Failed to load reviews:", error);
      toast.update(toastId, {
        render: "❌ Failed to load reviews",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  // === Delete Review ===
  const handleDelete = async (id) => {
    const toastId = toast.loading("Deleting review...");
    try {
      await axiosInstance.delete(reviewsAPI.delete(id));
      toast.update(toastId, {
        render: "🗑️ Review deleted.",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      fetchReviews();
    } catch (error) {
      console.error("❌ Failed to delete review:", error);
      toast.update(toastId, {
        render: "❌ Failed to delete review.",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  // === Reply to Review ===
  const handleReply = async (id) => {
    const reply = replyMap[id];
    if (!reply?.trim()) {
      toast.warning("⚠️ Reply cannot be empty.");
      return;
    }

    const toastId = toast.loading("Sending reply...");
    try {
      // ✅ must be POST, not PATCH
      await axiosInstance.post(reviewsAPI.reply(id), { reply });
      toast.update(toastId, {
        render: "✅ Reply sent.",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      setReplyMap((prev) => ({ ...prev, [id]: "" }));
      fetchReviews();
    } catch (error) {
      console.error("❌ Failed to send reply:", error);
      toast.update(toastId, {
        render: "❌ Failed to send reply.",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  // === Approve Review ===
  const handleApprove = async (id) => {
    const toastId = toast.loading("Approving review...");
    try {
      // ✅ must be POST, not PATCH
      await axiosInstance.post(reviewsAPI.approve(id));
      toast.update(toastId, {
        render: "✅ Review approved.",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      fetchReviews();
    } catch (error) {
      console.error("❌ Failed to approve review:", error);
      toast.update(toastId, {
        render: "❌ Failed to approve review.",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  // === Reply input state ===
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
        reviews.map((review) => (
          <div className="review-card" key={review.id}>
            <p>
              <strong>Service:</strong> {review.service_display || review.service}
            </p>
            <p>
              <strong>Rating:</strong> {review.rating} ⭐
            </p>
            <p>
              <strong>Comment:</strong> "{review.comment}"
            </p>
            <p className="review-author">
              <strong>By:</strong> {review.user_email}
            </p>
            <p>
              <strong>Submitted:</strong>{" "}
              {new Date(review.created_at).toLocaleString()}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {review.approved ? "✅ Approved" : "❌ Pending Approval"}
            </p>

            {review.reply && (
              <p className="review-reply">
                <strong>Admin Reply:</strong> {review.reply}
              </p>
            )}

            {!review.approved && (
              <button className="approve-btn" onClick={() => handleApprove(review.id)}>
                ✅ Approve
              </button>
            )}

            <textarea
              placeholder="Type your reply..."
              value={replyMap[review.id] || ""}
              onChange={(e) => handleReplyChange(review.id, e.target.value)}
            />

            <div className="review-actions">
              <button onClick={() => handleReply(review.id)}>💬 Reply</button>
              <button onClick={() => handleDelete(review.id)}>🗑️ Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ReviewsManagement;
