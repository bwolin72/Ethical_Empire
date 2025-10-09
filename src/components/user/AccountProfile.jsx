import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { FaStar } from "react-icons/fa";

// ✅ Use named imports (Option 2)
import profileService from "../../api/services/profileService";
import bookingService from "../../api/services/bookingService";
import authService from "../../api/services/authService";
import reviewService from "../../api/services/reviewService";

import { logoutHelper } from "../../utils/logoutHelper";

import "react-toastify/dist/ReactToastify.css";
import "./AccountProfile.css";

// -------- Star Rating Component --------
const StarRating = ({ rating, setRating }) => (
  <div className="star-rating" role="radiogroup" aria-label="Star rating">
    {[...Array(5)].map((_, i) => {
      const value = i + 1;
      return (
        <FaStar
          key={i}
          onClick={() => setRating(value)}
          color={i < rating ? "#FFD700" : "#ccc"}
          style={{ cursor: "pointer", fontSize: "1.5rem" }}
          role="radio"
          aria-checked={rating === value}
          tabIndex={0}
          aria-label={`${value} star${value > 1 ? "s" : ""}`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setRating(value);
          }}
        />
      );
    })}
  </div>
);

// -------- AccountProfile Component --------
const AccountProfile = ({ profile: externalProfile }) => {
  const [profile, setProfile] = useState(externalProfile || null);
  const [loading, setLoading] = useState(!externalProfile);
  const [profileImage, setProfileImage] = useState("");
  const [roleInfo, setRoleInfo] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loggingOut, setLoggingOut] = useState(false);
  const [review, setReview] = useState("");
  const [reviewServiceName, setReviewServiceName] = useState(""); // ✅ rename to avoid clash
  const [reviewRating, setReviewRating] = useState(5);

  const navigate = useNavigate();
  const location = useLocation();

  const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
  const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

  // -------- Load profile if not passed in --------
  useEffect(() => {
    if (externalProfile) {
      setProfile(externalProfile);
      setProfileImage(externalProfile.profile_image_url || "");
      return;
    }

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const [profileRes, bookingsRes, roleRes] = await Promise.all([
          profileService.get(),
          bookingService.userBookings(),
          authService.currentRole(),
        ]);

        const p = profileRes?.data || {};
        setProfile({
          id: p.id || null,
          first_name: p.first_name || "",
          last_name: p.last_name || "",
          name:
            p.name ||
            `${p.first_name || ""} ${p.last_name || ""}`.trim() ||
            "Unknown",
          email: p.email || "",
          phone: p.phone || p.contact_number || "",
          profile_image_url: p.profile_image_url || "",
          ...p,
        });
        setProfileImage(p.profile_image_url || "");
        setBookings(bookingsRes?.data || []);
        setRoleInfo(roleRes?.data || null);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("[AccountProfile] Failed to load profile data:", err);
          toast.error("Failed to load profile.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [externalProfile]);

  // -------- Get initials fallback --------
  const getInitials = useCallback((name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }, []);

  // -------- Upload profile image --------
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
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
      if (!uploadData.secure_url)
        throw new Error("No secure URL returned from Cloudinary.");

      await profileService.update({ profile_image_url: uploadData.secure_url });

      setProfileImage(uploadData.secure_url);
      setProfile((prev) =>
        prev ? { ...prev, profile_image_url: uploadData.secure_url } : prev
      );
      toast.success("Profile picture updated!");
    } catch (err) {
      console.error("[AccountProfile] Upload failed:", err);
      toast.error("Upload failed.");
    }
  };

  // -------- Submit Review --------
  const handleReviewSubmit = async () => {
    if (!review.trim() || !reviewServiceName) {
      toast.warn("Please fill in all fields.");
      return;
    }
    try {
      await reviewService.create({
        comment: review,
        service: reviewServiceName,
        rating: reviewRating,
      });
      toast.success("Review submitted!");
      setReview("");
      setReviewServiceName("");
      setReviewRating(5);
    } catch (err) {
      console.error("[AccountProfile] Review submit failed:", err);
      toast.error("Failed to submit review.");
    }
  };

  // -------- Logout --------
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    setLoggingOut(true);
    try {
      await authService.logout();
    } catch (e) {
      console.warn("[AccountProfile] Logout endpoint error:", e);
    } finally {
      await logoutHelper();
    }
  };

  // -------- Close profile handler --------
  const handleClose = () => {
    const role = (roleInfo?.role || "").toLowerCase();
    const paths = {
      admin: "/admin",
      user: "/user",
      vendor: "/vendor-profile",
      partner: "/partner-profile",
    };
    if (role && paths[role]) navigate(paths[role]);
    else if (location.key !== "default") navigate(-1);
    else navigate("/");
  };

  // -------- Render booking status --------
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

  const bookedServices = [
    ...new Set(bookings.map((b) => b.service_type).filter(Boolean)),
  ];
  const staticServices = [
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
  const reviewServices = Array.from(
    new Set([...bookedServices, ...staticServices])
  );

  if (loading) return <div className="skeleton-loader">Loading profile...</div>;

  return (
    <div className="account-profile-container" role="main" aria-label="Account Profile">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar theme="colored" />

      <button className="close-btn" onClick={handleClose} aria-label="Close profile">
        ✖
      </button>

      <div className="account-profile">
        {/* Profile Header */}
        <div className="account-header">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="profile-image" />
          ) : (
            <div className="profile-initials">{getInitials(profile?.name)}</div>
          )}
          <label className="upload-button" htmlFor="profile-image-upload">
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

        {/* User Info */}
        <section className="user-info">
          <h3>@{profile?.name || "Unknown User"}</h3>
          <p><strong>Name:</strong> {profile?.name || "N/A"}</p>
          <p><strong>Email:</strong> {profile?.email || "N/A"}</p>
          <p><strong>Phone:</strong> {profile?.phone || "N/A"}</p>
          {roleInfo?.role && <p><strong>Role:</strong> {roleInfo.role}</p>}
          <div className="button-group">
            <button onClick={() => navigate("/edit-profile")}>Edit Profile</button>
            <button onClick={() => navigate("/update-password")}>Change Password</button>
          </div>
        </section>

        {/* Bookings */}
        <section className="booking-section">
          <h4>My Bookings ({bookings.length})</h4>
          {bookings.length > 0 ? (
            bookings.map((bk) => (
              <article key={bk.id} className="booking-card">
                <p><strong>Service:</strong> {bk.service_type || "N/A"}</p>
                <p>
                  <strong>Date:</strong>{" "}
                  {bk.event_date
                    ? new Date(bk.event_date).toLocaleDateString()
                    : "N/A"}
                </p>
                <p><strong>Status:</strong> {renderBookingStatus(bk.status)}</p>
              </article>
            ))
          ) : (
            <div className="empty-bookings">
              <img src="/no-bookings.svg" alt="No bookings" />
              <p>No bookings yet. Explore services to get started!</p>
            </div>
          )}
        </section>

        {/* Reviews */}
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
            value={reviewServiceName}
            onChange={(e) => setReviewServiceName(e.target.value)}
          >
            <option value="">Select Service</option>
            {reviewServices.map((service) => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
          <label>Rating</label>
          <StarRating rating={reviewRating} setRating={setReviewRating} />
          <button className="btn" onClick={handleReviewSubmit}>Submit Review</button>
        </section>

        {/* Logout */}
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
