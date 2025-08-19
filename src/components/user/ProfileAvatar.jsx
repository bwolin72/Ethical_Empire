// src/components/ProfileAvatar.jsx
import React, { useRef } from "react";
import apiService from "../../api/apiService"; // centralized services
import "./ProfileAvatar.css";

const ProfileAvatar = ({ profile, onProfileUpdate }) => {
  const fileInputRef = useRef();
  const imageUrl = profile?.profile_image_url || "";
  const name = profile?.name || "Guest";
  const email = profile?.email || "";

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);

    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    try {
      const res = await fetch(uploadUrl, { method: "POST", body: formData });
      const data = await res.json();

      if (data.secure_url) {
        await updateProfileImage(data.secure_url);
      }
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const updateProfileImage = async (url) => {
    try {
      await apiService.auth.updateProfile({ profile_image_url: url });
      if (onProfileUpdate) onProfileUpdate({ ...profile, profile_image_url: url });
    } catch (err) {
      console.error("Profile update failed", err);
    }
  };

  const handleRemove = async () => {
    try {
      await apiService.auth.updateProfile({ profile_image_url: null });
      if (onProfileUpdate) onProfileUpdate({ ...profile, profile_image_url: null });
    } catch (err) {
      console.error("Failed to remove image", err);
    }
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="profile-avatar">
      <div className="avatar-box" onClick={handleClick}>
        {imageUrl ? (
          <img src={imageUrl} alt="Profile" className="avatar-image" />
        ) : (
          <div className="avatar-fallback">{initials}</div>
        )}
        <div className="avatar-overlay">Change</div>
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        hidden
      />

      <div className="profile-desc">
        <p><strong>{name}</strong></p>
        <p>{email}</p>
        {imageUrl && (
          <button onClick={handleRemove} className="remove-btn">
            Remove Photo
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileAvatar;
