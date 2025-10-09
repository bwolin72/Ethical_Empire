import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { FaStar, FaCamera } from "react-icons/fa";

import profileService from "../../api/services/profileService";
import bookingService from "../../api/services/bookingService";
import authService from "../../api/services/authService";
import reviewService from "../../api/services/reviewService";
import { logoutHelper } from "../../utils/logoutHelper";

import "react-toastify/dist/ReactToastify.css";
import "./AccountProfile.css"; // custom CSS (we’ll base our design around this)

const StarRating = ({ rating, setRating }) => (
  <div className="star-rating" role="radiogroup" aria-label="Star rating">
    {[1, 2, 3, 4, 5].map((val) => (
      <FaStar
        key={val}
        className="star"
        color={val <= rating ? "#facc15" : "#d1d5db"}
        onClick={() => setRating(val)}
        onKeyDown={(e) => (["Enter", " "].includes(e.key) ? setRating(val) : null)}
        role="radio"
        aria-checked={rating === val}
        tabIndex={0}
      />
    ))}
  </div>
);

const AccountProfile = ({ profile: externalProfile }) => {
  const [profile, setProfile] = useState(externalProfile || null);
  const [profileImage, setProfileImage] = useState("");
  const [bookings, setBookings] = useState([]);
  const [roleInfo, setRoleInfo] = useState(null);
  const [loading, setLoading] = useState(!externalProfile);
  const [loggingOut, setLoggingOut] = useState(false);
  const [review, setReview] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [rating, setRating] = useState(5);

  const navigate = useNavigate();
  const location = useLocation();

  const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
  const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    if (externalProfile) {
      setProfile(externalProfile);
      setProfileImage(externalProfile.profile_image_url || "");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    (async () => {
      try {
        const [profileRes, bookingsRes, roleRes] = await Promise.all([
          profileService.get(),
          bookingService.userBookings(),
          authService.currentRole(),
        ]);

        const p = profileRes?.data || {};
        setProfile({
          id: p.id || null,
          name: p.name || `${p.first_name || ""} ${p.last_name || ""}`.trim(),
          email: p.email || "",
          phone: p.phone || p.contact_number || "",
          profile_image_url: p.profile_image_url || "",
        });
        setProfileImage(p.profile_image_url || "");
        setBookings(Array.isArray(bookingsRes?.data) ? bookingsRes.data : []);
        setRoleInfo(roleRes?.data || null);
      } catch (err) {
        console.error("[AccountProfile] Failed to load profile:", err);
        toast.error("Could not load profile information.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [externalProfile]);

  // ---------------- HELPERS ----------------
  const getInitials = useCallback((name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Only image files allowed.");
    if (file.size > 2 * 1024 * 1024) return toast.error("Max file size: 2MB");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (!data.secure_url) throw new Error("Upload failed");

      await profileService.update({ profile_image_url: data.secure_url });
      setProfileImage(data.secure_url);
      setProfile((prev) => ({ ...prev, profile_image_url: data.secure_url }));
      toast.success("Profile image updated!");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Try again.");
    }
  };

  const handleReviewSubmit = async () => {
    if (!review.trim() || !serviceName) {
      return toast.warn("Please fill all fields.");
    }
    try {
      await reviewService.create({ comment: review, service: serviceName, rating });
      toast.success("Review submitted!");
      setReview("");
      setServiceName("");
      setRating(5);
    } catch (err) {
      console.error(err);
      toast.error("Could not submit review.");
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    setLoggingOut(true);
    try {
      await authService.logout();
    } catch (e) {
      console.warn(e);
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
    if (role && paths[role]) navigate(paths[role]);
    else if (location.key !== "default") navigate(-1);
    else navigate("/");
  };

  const bookedServices = Array.isArray(bookings)
    ? bookings
        .map((b) => b?.service_type)
        .filter((s) => typeof s === "string" && s.trim() !== "")
    : [];

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

  const reviewServices = [...new Set([...bookedServices, ...staticServices])];

  if (loading)
    return <div className="profile-loader">Loading your profile...</div>;

  return (
    <div className="profile-wrapper fade-in">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar theme="colored" />

      <header className="profile-header">
        <button onClick={handleClose} className="close-btn" aria-label="Close profile">✕</button>
        <div className="avatar-wrapper">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="avatar" />
          ) : (
            <div className="avatar-fallback">{getInitials(profile?.name)}</div>
          )}
          <label className="upload-overlay">
            <FaCamera />
            <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
          </label>
        </div>
        <h2 className="user-name">{profile?.name || "Unknown User"}</h2>
        <p className="user-role">{roleInfo?.role || "Member"}</p>
      </header>

      <section className="profile-info card">
        <h3>Account Info</h3>
        <p><strong>Email:</strong> {profile?.email || "N/A"}</p>
        <p><strong>Phone:</strong> {profile?.phone || "N/A"}</p>
        <div className="actions">
          <button onClick={() => navigate("/edit-profile")}>Edit Profile</button>
          <button onClick={() => navigate("/update-password")}>Change Password</button>
        </div>
      </section>

      <section className="bookings card">
        <h3>My Bookings ({bookings.length})</h3>
        {bookings.length ? (
          bookings.map((b) => (
            <div key={b.id} className="booking-item">
              <div><strong>Service:</strong> {b.service_type || "N/A"}</div>
              <div><strong>Date:</strong> {b.event_date ? new Date(b.event_date).toLocaleDateString() : "N/A"}</div>
              <div><strong>Status:</strong> <span className={`status ${b.status}`}>{b.status}</span></div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <img src="/no-bookings.svg" alt="No bookings" />
            <p>No bookings yet. Explore our services to get started!</p>
          </div>
        )}
      </section>

      <section className="review card">
        <h3>Write a Review</h3>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your experience..."
          rows={4}
        />
        <select value={serviceName} onChange={(e) => setServiceName(e.target.value)}>
          <option value="">Select Service</option>
          {reviewServices.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <StarRating rating={rating} setRating={setRating} />
        <button onClick={handleReviewSubmit} className="btn-primary">Submit Review</button>
      </section>

      <button
        className="btn-danger"
        onClick={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
};

export default AccountProfile;
