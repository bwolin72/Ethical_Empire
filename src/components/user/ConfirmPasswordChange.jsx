import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ConfirmPasswordChange.css"; // Ensure this file exists

const ConfirmPasswordChange = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("Processing password change...");

  useEffect(() => {
    const email = params.get("email");
    const token = params.get("token");
    let redirectTimeout;

    if (!email || !token) {
      toast.error("Missing email or token.");
      setStatus("error");
      setMessage("❌ Missing email or token in the URL.");
      setLoading(false);
      return;
    }

    axiosInstance
      .post("/accounts/profiles/password-update/confirm/", { email, token })
      .then(() => {
        toast.success("✅ Password updated. Please log in.");
        setStatus("success");
        setMessage("✅ Password updated successfully. Redirecting to login...");
        redirectTimeout = setTimeout(() => navigate("/login"), 2500);
      })
      .catch((err) => {
        const backendError = err.response?.data?.error || "❌ Invalid or expired link.";
        toast.error(backendError);
        setStatus("error");
        setMessage(`${backendError} Redirecting to retry...`);
        redirectTimeout = setTimeout(() => navigate("/update-password"), 3000);
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
