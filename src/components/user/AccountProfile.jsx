// src/components/account/AccountProfile.jsx
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
import "./AccountProfile.css";

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

  // safe extractor for varied API shapes
  const extractList = (res) => {
    if (!res) return [];
    const payload = res.data ?? res;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.results)) return payload.results;
    if (Array.isArray(payload.data)) return payload.data;
    return [];
  };

  // safe service-name extractor from bookings
  const extractServiceNamesFromBookings = (bookingsArr) => {
    if (!Array.isArray(bookingsArr)) return [];
    const names = bookingsArr.reduce((acc, b) => {
      try {
        // prefer explicit service_type
        if (b?.service_type && typeof b.service_type === "string") acc.push(b.service_type);
        // some serializers include service_details as array of { name, ... }
        if (Array.isArray(b?.service_details)) {
          b.service_details.forEach((sd) => {
            if (sd?.name) acc.push(sd.name);
          });
        }
        // some payloads include services as objects or ids
        if (Array.isArray(b?.services)) {
          b.services.forEach((s) => {
            if (typeof s === "string") acc.push(s);
            else if (s?.name) acc.push(s.name);
          });
        }
      } catch (e) {
        // ignore per-item errors
      }
      return acc;
    }, []);
    return names.map((n) => (typeof n === "string" ? n.trim() : "")).filter(Boolean);
  };

  // load profile & bookings
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
          profileService.get?.() ?? profileService.getProfile?.() ?? { data: null },
          bookingService.userBookings?.() ?? { data: [] },
          authService.currentRole?.() ?? authService.currentUserRole?.() ?? { data: null },
        ]);

        const p = profileRes?.data ?? profileRes ?? {};
        setProfile({
          id: p.id ?? null,
          name: p.name ?? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim(),
          email: p.email ?? "",
          phone: p.phone ?? p.contact_number ?? "",
          profile_image_url: p.profile_image_url ?? "",
          ...p,
        });
        setProfileImage(p.profile_image_url ?? "");

        const bookingsList = extractList(bookingsRes);
        setBookings(bookingsList);

        const rolePayload = roleRes?.data ?? roleRes ?? null;
        setRoleInfo(rolePayload);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("[AccountProfile] Failed to load profile:", err);
          toast.error("Could not load profile information.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [externalProfile]);

  const getInitials = useCallback((name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    return (parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "");
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Only image files allowed.");
    if (file.size > 2 * 1024 * 1024) return toast.error("Max file size: 2MB");
    if (!CLOUDINARY_UPLOAD_PRESET || !CLOUDINARY_CLOUD_NAME)
      return toast.error("Cloudinary configuration is missing.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (!data?.secure_url) throw new Error("Upload failed");
      await profileService.update?.({ profile_image_url: data.secure_url }) ?? null;
      setProfileImage(data.secure_url);
      setProfile((prev) => (prev ? { ...prev, profile_image_url: data.secure_url } : prev));
      toast.success("Profile image updated!");
    } catch (err) {
      console.error("[AccountProfile] Upload error", err);
      toast.error("Upload failed. Try again.");
    }
  };

  const handleReviewSubmit = async () => {
    if (!review.trim() || !serviceName) return toast.warn("Please fill all fields.");
    try {
      await reviewService.create?.({ comment: review, service: serviceName, rating });
      toast.success("Review submitted!");
      setReview("");
      setServiceName("");
      setRating(5);
    } catch (err) {
      console.error("[AccountProfile] Review error", err);
      toast.error("Could not submit review.");
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    setLoggingOut(true);
    try {
      await authService.logout?.();
    } catch (e) {
      console.warn("[AccountProfile] logout api error", e);
    } finally {
      await logoutHelper();
    }
  };

  const handleClose = () => {
    const role = (roleInfo?.role ?? roleInfo ?? "").toString().toLowerCase();
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

  // build review services list robustly
  const bookedServiceNames = extractServiceNamesFromBookings(bookings);
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
  const reviewServices = Array.from(new Set([...bookedServiceNames, ...staticServices]));

  if (loading) return <div className="profile-loader">Loading your profile...</div>;

  return (
    <div className="profile-wrapper fade-in" role="main" aria-label="Account profile">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar theme="colored" />

      <header className="profile-header">
        <button onClick={handleClose} className="close-btn" aria-label="Close profile">✕</button>

        <div className="avatar-wrapper" aria-hidden="false">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="avatar" />
          ) : (
            <div className="avatar-fallback" aria-hidden>
              {getInitials(profile?.name)}
            </div>
          )}

          <label className="upload-overlay" title="Upload profile picture" aria-label="Upload profile picture">
            <FaCamera />
            <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
          </label>
        </div>

        <h2 className="user-name">{profile?.name ?? "Unknown User"}</h2>
        <p className="user-role">{(roleInfo && roleInfo.role) ? roleInfo.role : (typeof roleInfo === "string" ? roleInfo : "Member")}</p>
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
        {bookings.length > 0 ? (
          bookings.map((b) => (
            <div key={b?.id ?? Math.random()} className="booking-item">
              <div><strong>Service:</strong> {b.service_type ?? (Array.isArray(b.service_details) ? b.service_details.map(sd => sd.name).join(", ") : "N/A")}</div>
              <div><strong>Date:</strong> {b.event_date ? new Date(b.event_date).toLocaleDateString() : "N/A"}</div>
              <div><strong>Status:</strong> <span className={`status ${b.status ?? ""}`}>{b.status ?? "Unknown"}</span></div>
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
          aria-label="Review text"
        />
        <select value={serviceName} onChange={(e) => setServiceName(e.target.value)} aria-label="Select service">
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
