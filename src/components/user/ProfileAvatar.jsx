import React, { useRef } from "react";
import apiService from "../../api/apiService";
import "./ProfileAvatar.css";

const ProfileAvatar = ({ profile, onProfileUpdate }) => {
  const fileInputRef = useRef();
  const imageUrl = profile?.profile_image_url || "";
  const name = profile?.name || "Guest";
  const email = profile?.email || "";

  const handleClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || !process.env.REACT_APP_CLOUDINARY_CLOUD_NAME) {
      console.error("❌ Cloudinary config missing in env.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`;

    try {
      const res = await fetch(uploadUrl, { method: "POST", body: formData });
      const data = await res.json();

      if (!data.secure_url) throw new Error("Upload failed: no secure_url");

      await updateProfileImage(data.secure_url);
    } catch (err) {
      console.error("❌ Upload failed:", err);
    }
  };

  const updateProfileImage = async (url) => {
    try {
      await apiService.auth.updateProfile({ profile_image_url: url });
      if (onProfileUpdate) onProfileUpdate({ ...profile, profile_image_url: url });
    } catch (err) {
      console.error("❌ Profile update failed:", err);
    }
  };

  const handleRemove = async () => {
    try {
      await apiService.auth.updateProfile({ profile_image_url: null });
      if (onProfileUpdate) onProfileUpdate({ ...profile, profile_image_url: null });
    } catch (err) {
      console.error("❌ Failed to remove image:", err);
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
      <div className="avatar-box" onClick={handleClick} role="button" tabIndex={0}>
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
