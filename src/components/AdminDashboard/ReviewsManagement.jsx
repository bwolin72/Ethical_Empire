// src/components/admin/ReviewsManagement.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import reviewService from "../../api/services/reviewService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ReviewsManagement.css";

// ==============================
// Error Helper for Toast
// ==============================
const showErrorToast = (error) => {
  let message = "An unexpected error occurred";
  if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.message) {
    message = error.message;
  }
  toast.error(`❌ ${message}`);
};

const ReviewsManagement = () => {
  const queryClient = useQueryClient();
  const [replyMap, setReplyMap] = useState({});

  // ==============================
  // Fetch all reviews
  // ==============================
  const { data: reviews = [], isLoading } = useQuery(
    ["reviews"],
    async () => {
      const res = await reviewService.getAllReviewsAdmin();
      return res?.data?.results || [];
    },
    {
      onError: showErrorToast,
    }
  );

  // ==============================
  // Approve review
  // ==============================
  const approveMutation = useMutation(
    (id) => reviewService.approveReview(id),
    {
      onSuccess: () => {
        toast.success("✅ Review approved");
        queryClient.invalidateQueries(["reviews"]);
      },
      onError: showErrorToast,
    }
  );

  // ==============================
  // Reply to review
  // ==============================
  const replyMutation = useMutation(
    ({ id, reply }) => reviewService.replyToReview(id, { reply }),
    {
      onSuccess: (_, { id }) => {
        toast.success("✅ Reply sent");
        setReplyMap((prev) => ({ ...prev, [id]: "" }));
        queryClient.invalidateQueries(["reviews"]);
      },
      onError: showErrorToast,
    }
  );

  // ==============================
  // Delete review
  // ==============================
  const deleteMutation = useMutation(
    (id) => reviewService.deleteReview(id),
    {
      onSuccess: () => {
        toast.success("🗑️ Review deleted");
        queryClient.invalidateQueries(["reviews"]);
      },
      onError: showErrorToast,
    }
  );

  // ==============================
  // Handlers
  // ==============================
  const handleReplyChange = (id, value) => {
    setReplyMap((prev) => ({ ...prev, [id]: value }));
  };

  const handleReply = (id) => {
    const reply = replyMap[id]?.trim();
    if (!reply) {
      toast.warning("⚠️ Reply cannot be empty.");
      return;
    }
    replyMutation.mutate({ id, reply });
  };

  // ==============================
  // Render
  // ==============================
  return (
    <div className="reviews-panel">
      <ToastContainer position="top-right" autoClose={2000} />
      <h2>Reviews Management</h2>

      {isLoading ? (
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
              <button className="approve-btn" onClick={() => approveMutation.mutate(r.id)}>
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
              <button onClick={() => deleteMutation.mutate(r.id)}>🗑️ Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ReviewsManagement;
