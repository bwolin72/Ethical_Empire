import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ConfirmPasswordChange.css"; // Ensure CSS path is correct

const ConfirmPasswordChange = () => {
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("Processing password change...");
  const navigate = useNavigate();

  useEffect(() => {
    const email = params.get("email");
    const token = params.get("token");

    if (!email || !token) {
      toast.error("Missing email or token.");
      setStatus("error");
      setMessage("Missing email or token in the URL.");
      setLoading(false);
      return;
    }

    axiosInstance
      .post("/accounts/profiles/password-update/confirm/", { email, token })
      .then(() => {
        toast.success("✅ Password updated. Please login.");
        setStatus("success");
        setMessage("✅ Password updated successfully. Redirecting to login...");
        setTimeout(() => navigate("/login"), 2500);
      })
      .catch(() => {
        toast.error("❌ Invalid or expired link.");
        setStatus("error");
        setMessage("❌ Invalid or expired link. Redirecting to retry...");
        setTimeout(() => navigate("/update-password"), 3000);
      })
      .finally(() => setLoading(false));
  }, [params, navigate]);

  return (
    <div className="confirm-container">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar theme="colored" />

      <div className={`confirm-message ${status}`}>
        {loading ? (
          <div className="loader">
            <span className="spinner" /> {/* Optionally use an animated spinner */}
            <p>{message}</p>
          </div>
        ) : (
          <p>{message}</p>
        )}
      </div>
    </div>
  );
};

export default ConfirmPasswordChange;
