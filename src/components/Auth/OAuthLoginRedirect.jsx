// src/components/Auth/OAuthLoginRedirect.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OAuthLoginRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithGoogle, user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      navigate("/login");
      return;
    }

    loginWithGoogle(token)
      .then(() => {
        // redirect based on role if needed
        if (user?.role === "admin") navigate("/admin");
        else if (user?.role === "vendor") navigate("/vendor-profile");
        else if (user?.role === "partner") navigate("/partner-dashboard");
        else if (user?.role === "worker") navigate("/worker-dashboard");
        else navigate("/user"); // default user page
      })
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false));
  }, [searchParams, loginWithGoogle, navigate, user]);

  if (loading) return <p>Logging in with Google...</p>;
  return null;
}
