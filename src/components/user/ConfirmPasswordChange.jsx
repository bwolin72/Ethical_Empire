// src/components/auth/ConfirmPasswordChange.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import authAPI from "../../api/authAPI"; // ✅ updated import
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ConfirmPasswordChange.css";

const ConfirmPasswordChange = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("Processing password change...");

  useEffect(() => {
    const uidb64 = params.get("uid");
    const token = params.get("token");
    let redirectTimeout;

    if (!uidb64 || !token) {
      toast.error("Missing reset credentials.");
      setStatus("error");
      setMessage("❌ Missing UID or token in the URL.");
      setLoading(false);
      return;
    }

    // Typically backend requires new password, for demo we send placeholder
    const payload = {
      new_password: "TempPassword123!", // ✅ Replace with real form input if you have UI
    };

    authAPI
      .resetPasswordConfirm(uidb64, token, payload)
      .then(() => {
        toast.success("✅ Password has been reset. Please log in.");
        setStatus("success");
        setMessage("✅ Password updated successfully. Redirecting to login...");
        redirectTimeout = setTimeout(() => navigate("/login"), 2500);
      })
      .catch((err) => {
        const backendError =
          err.response?.data?.detail ||
          err.response?.data?.error ||
          "❌ Invalid or expired reset link.";
        toast.error(backendError);
        setStatus("error");
        setMessage(`${backendError} Redirecting to retry...`);
        redirectTimeout = setTimeout(() => navigate("/reset-password"), 3000);
      })
      .finally(() => setLoading(false));

    return () => {
      if (redirectTimeout) clearTimeout(redirectTimeout);
    };
  }, [params, navigate]);

  return (
    <div className="confirm-container">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar theme="colored" />

      <div className={`confirm-message ${status}`}>
        {loading ? (
          <div className="loader">
            <span className="spinner" role="status" aria-label="Processing..." />
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
