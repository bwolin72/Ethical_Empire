// src/components/whatever/AccountProfile.jsx
import React, { useEffect, useState, useCallback } from "react";
import apiService from "../../api/apiService"; // service-layer aggregator (auth, bookings, reviews, ...)
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { logoutHelper } from "../../utils/logoutHelper";
import { FaStar } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import "./AccountProfile.css";

const StarRating = ({ rating, setRating }) => (
  <div className="star-rating">
    {[...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        onClick={() => setRating(i + 1)}
        color={i < rating ? "#FFD700" : "#ccc"}
        style={{ cursor: "pointer", fontSize: "1.2rem" }}
        role="button"
        tabIndex={0}
        aria-label={`Rate ${i + 1} star${i > 0 ? "s" : ""}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setRating(i + 1);
        }}
      />
    ))}
  </div>
);

const AccountProfile = ({ profile: externalProfile }) => {
  const [profile, setProfile] = useState(externalProfile || null);
  const [loading, setLoading] = useState(!externalProfile);
  const [review, setReview] = useState("");
  const [reviewService, setReviewService] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [profileImage, setProfileImage] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loggingOut, setLoggingOut] = useState(false);
  const [roleInfo, setRoleInfo] = useState(null);

  const navigate = useNavigate();

  const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
  const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

  useEffect(() => {
    if (externalProfile) {
      setProfileImage(externalProfile.profile_image_url || "");
      return;
    }

    const controller = new AbortController();
    let mounted = true;

    const fetchData = async () => {
      try {
        // note: these service methods should accept an optional axios config { signal }
        const [profileRes, bookingsRes, roleRes] = await Promise.all([
          apiService.auth.getProfile?.({ signal: controller.signal }) ??
            apiService.auth.getProfile?.(),
          apiService.bookings.getUserBookings?.({ signal: controller.signal }) ??
            apiService.bookings.getUserBookings?.(),
          apiService.auth.getCurrentUserRole?.({ signal: controller.signal }) ??
            apiService.auth.getCurrentUserRole?.(),
        ]);

        if (!mounted) return;

        if (profileRes?.data) {
          setProfile(profileRes.data);
          setProfileImage(profileRes.data.profile_image_url || "");
        }
        if (bookingsRes?.data) setBookings(bookingsRes.data);
        if (roleRes?.data) setRoleInfo(roleRes.data);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Error loading profile data:", err);
          toast.error("Failed to load profile.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [externalProfile]);

  const getInitials = useCallback((name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!CLOUDINARY_UPLOAD_PRESET || !CLOUDINARY_CLOUD_NAME) {
      toast.error("Cloudinary config missing.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files allowed.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Max file size: 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const uploadData = await uploadRes.json();

      if (!uploadData.secure_url) throw new Error("Upload failed");

      // use auth.updateProfile to set profile image (matches /api/accounts/profile/ PATCH)
      // service should handle authenticated axiosInstance internally
      if (apiService.auth.updateProfile) {
        await apiService.auth.updateProfile({ profile_image_url: uploadData.secure_url });
      } else {
        // fallback: if your service function is named differently, adjust accordingly
        console.warn("apiService.auth.updateProfile not found; image not saved to profile");
      }

      setProfileImage(uploadData.secure_url);
      setProfile((prev) => (prev ? { ...prev, profile_image_url: uploadData.secure_url } : prev));

      toast.success("Profile picture updated!");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed.");
    }
  };

  const handleReviewSubmit = async () => {
    if (!review.trim() || !reviewService) {
      toast.warn("Please fill in all fields.");
      return;
    }

    try {
      // POST to /api/reviews/ ; create method name used here is `create`
      if (apiService.reviews.create) {
        await apiService.reviews.create({
          comment: review,
          service: reviewService,
          rating: reviewRating,
        });
      } else if (apiService.reviews.list) {
        // fallback if the service uses a different name
        await apiService.reviews.list({ comment: review, service: reviewService, rating: reviewRating });
      } else {
        throw new Error("Reviews service not available");
      }

      toast.success("Review submitted!");
      setReview("");
      setReviewService("");
      setReviewRating(5);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit review.");
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    setLoggingOut(true);
    try {
      // optional: call backend logout if available
      if (apiService.auth.logout) {
        await apiService.auth.logout();
      }
    } catch (e) {
      console.warn("logout endpoint error:", e);
    } finally {
      await logoutHelper();
    }
  };

  const handleClose = () => {
    const role = (roleInfo?.role || "").toLowerCase();
    const paths = {
      admin: "/admin",
      user: "/user",
      vendor: "/vendor-profile",
      partner: "/partner-profile",
    };
    navigate(paths[role] || "/");
  };

  const renderBookingStatus = (status) => {
    const colors = {
      pending: "#facc15",
      approved: "#22c55e",
      rejected: "#ef4444",
    };
    return (
      <span
        style={{
          backgroundColor: colors[status] || "#ccc",
          color: "#fff",
          padding: "0.3rem 0.6rem",
          borderRadius: 4,
          fontSize: "0.8rem",
        }}
      >
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
      </span>
    );
  };

  if (loading) return <div className="skeleton-loader">Loading profile...</div>;

  return (
    <div className="account-profile-container" role="main" aria-label="Account Profile">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar theme="colored" />
      <button className="close-btn" onClick={handleClose} aria-label="Close profile">
        ✖
      </button>

      <div className="account-profile">
        <div className="account-header">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="profile-image" />
          ) : (
            <div className="profile-initials">{getInitials(profile?.name)}</div>
          )}
          <label className="upload-button" htmlFor="profile-image-upload" tabIndex={0}>
            Upload Picture
            <input
              id="profile-image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              hidden
            />
          </label>
        </div>

        <section className="user-info">
          <h3>@{profile?.name}</h3>
          <p>
            <strong>Name:</strong> {profile?.name}
          </p>
          <p>
            <strong>Email:</strong> {profile?.email}
          </p>
          <p>
            <strong>Phone:</strong> {profile?.phone || "N/A"}
          </p>
          {roleInfo?.role && (
            <p>
              <strong>Role:</strong> {roleInfo.role}
            </p>
          )}
          <div className="button-group">
            <button onClick={() => navigate("/edit-profile")}>Edit Profile</button>
            <button onClick={() => navigate("/update-password")}>Change Password</button>
          </div>
        </section>

        <section className="booking-section">
          <h4>My Bookings ({bookings.length})</h4>
          {bookings.length > 0 ? (
            bookings.map((bk) => (
              <article key={bk.id} className="booking-card">
                <p>
                  <strong>Service:</strong> {bk.service_type}
                </p>
                <p>
                  <strong>Date:</strong> {new Date(bk.event_date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Status:</strong> {renderBookingStatus(bk.status)}
                </p>
              </article>
            ))
          ) : (
            <div className="empty-bookings">
              <img src="/no-bookings.svg" alt="No bookings" />
              <p>No bookings yet. Explore services to get started!</p>
            </div>
          )}
        </section>

        <section className="review-section">
          <label htmlFor="review-textarea">Write a Review</label>
          <textarea
            id="review-textarea"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience..."
            rows={4}
          />
          <label htmlFor="review-service-select">Service</label>
          <select
            id="review-service-select"
            value={reviewService}
            onChange={(e) => setReviewService(e.target.value)}
          >
            <option value="">Select Service</option>
            {[
              "Live Band",
              "DJ",
              "Photography",
              "Videography",
              "Catering",
              "Event Planning",
              "Lighting",
              "MC/Host",
              "Sound Setup",
            ].map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
          <label>Rating</label>
          <StarRating rating={reviewRating} setRating={setReviewRating} />
          <button className="btn" onClick={handleReviewSubmit}>
            Submit Review
          </button>
        </section>

        <button
          className="btn danger"
          onClick={handleLogout}
          disabled={loggingOut}
          aria-busy={loggingOut}
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
};

export default AccountProfile;
