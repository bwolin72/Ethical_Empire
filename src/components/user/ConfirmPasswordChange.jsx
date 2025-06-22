import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from '../../api/axiosInstance';

const ConfirmPasswordChange = () => {
  const [params] = useSearchParams();

  useEffect(() => {
    const email = params.get("email");
    const token = params.get("token");

    axiosInstance.post("/profiles/password-update/confirm/", { email, token })
      .then(() => alert("Password updated. Please login again."))
      .catch(() => alert("Invalid or expired link."));
  }, [params]);

  return <p>Processing password change...</p>;
};

export default ConfirmPasswordChange;
