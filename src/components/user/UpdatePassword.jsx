import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import "./UpdatePassword.css";

const UpdatePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleRequest = async () => {
    try {
      await axiosInstance.post("/api/profiles/password-update/request/", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      alert("Check your email to confirm the password change.");
    } catch (err) {
      alert(err.response?.data?.error || "Request failed.");
    }
  };

  return (
    <div className="password-update">
      <h2>Change Password</h2>
      <input type="password" placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
      <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
      <button onClick={handleRequest}>Submit Request</button>
    </div>
  );
};

export default UpdatePassword;
