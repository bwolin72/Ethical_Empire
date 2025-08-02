import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
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
        aria-label={`Rate ${i + 1} star${i > 0 ? "s" : ""}`}
        role="button"
        tabIndex={0}
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
  const [profileImage, setProfileImage] = useState(externalProfile?.profile_image || "");
  const [bookings, setBookings] = useState([]);
  const [loggingOut, setLoggingOut] = useState(false);
  const [roleInfo, setRoleInfo] = useState(null);

  const navigate = useNavigate();

  const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
  const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

  // Fetch profile, bookings, and role info only if no externalProfile provided
  useEffect(() => {
    if (externalProfile) return;

    const controller = new AbortController();
    const { signal } = controller;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileRes, bookingsRes, roleRes] = await Promise.all([
          axiosInstance.get("/accounts/profiles/profile/", { signal }),
          axiosInstance.get("/bookings/user/", { signal }),
          axiosInstance.get("/accounts/profile/role/", { signal }),
        ]);

        setProfile(profileRes.data);
        setProfileImage(profileRes.data.profile_image || "");
        setBookings(bookingsRes.data);
        setRoleInfo(roleRes.data);
      } catch (error) {
        if (!signal.aborted) {
          toast.error("Failed to load profile data.");
        }
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [externalProfile]);

  const getInitials = useCallback((name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!CLOUDINARY_UPLOAD_PRESET || !CLOUDINARY_CLOUD_NAME) {
      toast.error("Cloudinary configuration is missing.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const uploadData = await uploadRes.json();

      if (!uploadData.secure_url) throw new Error("Upload failed");

      // Update backend profile image
      const patchRes = await axiosInstance.patch("/accounts/profiles/profile/", {
        profile_image: uploadData.secure_url,
      });

      setProfileImage(uploadData.secure_url);
      setProfile((prev) => ({
        ...prev,
        profile_image: uploadData.secure_url,
        ...(patchRes.data || {}),
      }));

      toast.success("Profile picture updated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload or update image.");
    }
  };

  const handleReviewSubmit = async () => {
    if (!review.trim() || !reviewService) {
      toast.warn("Please fill in all review fields.");
      return;
    }

    try {
      await axiosInstance.post("/reviews/", {
        comment: review,
        service: reviewService,
        rating: reviewRating,
      });
      toast.success("Review submitted!");
      setReview("");
      setReviewService("");
      setReviewRating(5);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit review.");
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    setLoggingOut(true);
    await logoutHelper();
  };

  const handleClose = () => {
    const role = roleInfo?.role?.toLowerCase();
    const paths = {
      admin: "/admin/dashboard",
      user: "/user/dashboard",
      worker: "/worker/dashboard",
      partner: "/partner/dashboard",
      vendor: "/vendor/dashboard",
    };
    navigate(paths[role] || "/");
  };

  const renderBookingStatus = (status) => {
    const colors = {
      pending: "#facc15",
      approved: "#22c55e",
      rejected: "#ef4444",
    };
    const color = colors[status] || "#ccc";
    return (
      <span
        style={{
          backgroundColor: color,
          color: "#fff",
          padding: "0.3rem 0.6rem",
          borderRadius: 4,
          fontSize: "0.8rem",
        }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return <div className="skeleton-loader">Loading profile...</div>;
  }

  return (
    <div className="account-profile" role="main" aria-label="Account Profile">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar theme="colored" />
      <button
        className="close-btn"
        onClick={handleClose}
        aria-label="Close profile"
        type="button"
      >
        ✖
      </button>

      <div className="profile-wrapper">
        <div className="profile-header">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="profile-pic" />
          ) : (
            <div className="profile-initials" aria-label="Profile initials">
              {getInitials(profile?.name)}
            </div>
          )}
          <label className="upload-label" htmlFor="profile-image-upload" tabIndex={0}>
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

        <section className="user-info" aria-label="User information">
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
            <button type="button" onClick={() => navigate("/edit-profile")}>
              Edit Profile
            </button>
            <button type="button" onClick={() => navigate("/update-password")}>
              Change Password
            </button>
          </div>
        </section>

        <section className="booking-section" aria-label="User bookings">
          <h4>My Bookings ({bookings.length})</h4>
          {bookings.length > 0 ? (
            bookings.map((bk) => (
              <article key={bk.id} className="booking-card" aria-label={`Booking for ${bk.service_type}`}>
                <p>
                  <strong>Service:</strong>{" "}
                  {Array.isArray(bk.service_type) ? bk.service_type.join(", ") : bk.service_type || "N/A"}
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

        <section className="review-section" aria-label="Submit a review">
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

          <button className="btn" type="button" onClick={handleReviewSubmit}>
            Submit Review
          </button>
        </section>

        <button
          className="btn danger"
          type="button"
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
