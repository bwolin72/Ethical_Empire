import React, { useEffect, useState } from "react";
import reviewService from "../../api/services/reviewService";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import "./reviews.css";

const Reviews = ({ limit = null, hideForm = false }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    service: "",
    rating: "",
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ✅ Match Django SERVICE_CHOICES exactly
  const SERVICE_OPTIONS = [
    "Live Band",
    "DJ",
    "Photography",
    "Videography",
    "Catering",
    "Event Planning",
    "Lighting",
    "MC/Host",
    "Sound Setup",
  ];

  // Fetch approved reviews
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      let data = await reviewService.getApprovedReviews();

      if (limit) {
        data = data.slice(0, limit);
      }

      setReviews(data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await reviewService.submitReview(formData);
      setFormData({ service: "", rating: "", comment: "" });
      fetchReviews();
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(err.response?.data?.detail || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reviews-component">
      {/* Review Form (optional) */}
      {!hideForm && (
        <Card className="mb-6">
          <CardContent>
            <h2 className="text-lg font-semibold mb-3">Leave a Review</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Service dropdown */}
              <div>
                <label className="block text-sm font-medium">Service</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  required
                  className="w-full border rounded p-2"
                >
                  <option value="">Select a service</option>
                  {SERVICE_OPTIONS.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium">Rating (1–5)</label>
                <input
                  type="number"
                  name="rating"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={handleChange}
                  required
                  className="w-full border rounded p-2"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium">Comment</label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  required
                  className="w-full border rounded p-2"
                />
              </div>

              {error && <p className="text-red-500">{error}</p>}

              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <h2 className="text-lg font-semibold mb-3">Approved Reviews</h2>
      {loading ? (
        <p>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent>
                <p className="font-semibold">{review.service}</p>
                <p className="text-yellow-600">Rating: {review.rating}/5</p>
                <p className="mt-2">{review.comment}</p>
                <p className="text-sm text-gray-500 mt-2">
                  — {review.user_email}
                </p>
                {review.reply && (
                  <p className="text-sm text-blue-600 mt-2">
                    Reply: {review.reply}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
