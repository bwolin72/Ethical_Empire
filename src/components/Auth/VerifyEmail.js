// src/components/Auth/VerifyEmail.js
import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const uid = searchParams.get("uid");
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!uid || !token || !email) {
      toast.error("Invalid verification link.");
      navigate("/login");
      return;
    }

    // Call your backend API to verify
    axios
      .post(`${process.env.REACT_APP_API_URL}/accounts/verify-email/`, { uid, token, email })
      .then(() => {
        toast.success("Email verified successfully!");
        navigate("/login");
      })
      .catch(() => {
        toast.error("Invalid or expired verification link.");
        navigate("/login");
      });
  }, [searchParams, navigate]);

  return <div>Verifying your email...</div>;
};

export default VerifyEmail;
