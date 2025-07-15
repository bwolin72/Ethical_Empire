import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { logoutHelper } from "../../utils/logoutHelper";
import "react-toastify/dist/ReactToastify.css";
import "./AccountProfile.css";

const AccountProfile = ({ profile: externalProfile }) => {
  const [profile, setProfile] = useState(externalProfile || null);
  const [loading, setLoading] = useState(!externalProfile);
  const [review, setReview] = useState("");
  const [profileImage, setProfileImage] = useState(externalProfile?.profile_image || "");
  const [bookings, setBookings] = useState([]);
  const [loggingOut, setLoggingOut] = useState(false);
  const [roleInfo, setRoleInfo] = useState(null);
  const navigate = useNavigate();

  const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
  const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    if (!externalProfile) {
      axiosInstance
        .get("/accounts/profiles/profile/", { signal })
        .then((res) => {
          setProfile(res.data);
          setProfileImage(res.data.profile_image || "");
        })
        .catch(() => toast.error("Failed to load profile.", { autoClose: 3000 }))
        .finally(() => setLoading(false));
    }

    axiosInstance
      .get("/bookings/user/", { signal })
      .then((res) => setBookings(res.data))
      .catch(() => toast.warn("Could not fetch bookings.", { autoClose: 3000 }));

    axiosInstance
      .get("/accounts/profile/role/")
      .then((res) => setRoleInfo(res.data))
      .catch(() => toast.warn("Could not fetch role info.", { autoClose: 3000 }));

    return () => controller.abort();
  }, [externalProfile]);

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    return parts.length > 1
      ? parts[0][0].toUpperCase() + parts[1][0].toUpperCase()
      : parts[0][0].toUpperCase();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !CLOUDINARY_UPLOAD_PRESET || !CLOUDINARY_CLOUD_NAME) {
      toast.error("Missing file or Cloudinary config.", { autoClose: 3000 });
      return;
    }

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

      await axiosInstance.patch("/accounts/profiles/profile/", {
        profile_image: data.secure_url,
      });

      setProfileImage(data.secure_url);
      toast.success("Profile picture updated!", { autoClose: 3000 });
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed.", { autoClose: 3000 });
    }
  };

  const handleReviewSubmit = async () => {
    if (!review.trim()) {
      toast.warn("Review cannot be empty.", { autoClose: 3000 });
      return;
    }
    try {
      await axiosInstance.post("/reviews/", { comment: review });
      toast.success("Review submitted!", { autoClose: 3000 });
      setReview("");
    } catch {
      toast.error("Failed to submit review.", { autoClose: 3000 });
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutHelper();
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
          borderRadius: "4px",
          fontSize: "0.8rem",
        }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) return <p className="loading-text">Loading profile...</p>;

  return (
    <div className="account-profile">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar theme="colored" />
      <button className="close-btn" onClick={() => window.location.reload()}>✖</button>

      <div className="profile-wrapper">
        {/* Profile Picture */}
        <div className="profile-header">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="profile-pic" />
          ) : (
            <div className="profile-initials">{getInitials(profile?.name)}</div>
          )}
          <label className="upload-label" role="button">
            Upload Picture
            <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
          </label>
        </div>

        {/* Info */}
        <div className="user-info">
          <h3>@{profile?.name}</h3>
          <p><strong>Name:</strong> {profile?.name}</p>
          <p><strong>Email:</strong> {profile?.email}</p>
          <p><strong>Phone:</strong> {profile?.phone || "N/A"}</p>
          {roleInfo?.role && <p><strong>Role:</strong> {roleInfo.role}</p>}
          <div className="button-group">
            <button onClick={() => navigate("/edit-profile")}>Edit Profile</button>
            <button onClick={() => navigate("/update-password")}>Change Password</button>
          </div>
        </div>

        {/* Bookings */}
        <div className="booking-section">
          <h4>My Bookings ({bookings.length})</h4>
          {bookings.length ? (
            bookings.map((bk) => (
              <div key={bk.id} className="booking-card">
                <p><strong>Service:</strong> {Array.isArray(bk.service_type) ? bk.service_type.join(", ") : "N/A"}</p>
                <p><strong>Date:</strong> {bk.event_date}</p>
                <p><strong>Status:</strong> {renderBookingStatus(bk.status)}</p>
              </div>
            ))
          ) : (
            <p>No bookings yet.</p>
          )}
        </div>

        {/* Review */}
        <div className="review-section">
          <label htmlFor="review">Write a Review</label>
          <textarea
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience..."
          />
          <button className="btn" onClick={handleReviewSubmit}>Submit Review</button>
        </div>

        {/* Logout */}
        <button className="btn danger" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
};

export default AccountProfile;
