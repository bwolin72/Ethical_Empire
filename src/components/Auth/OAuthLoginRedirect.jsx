// src/components/Auth/OAuthLoginRedirect.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { roleRoutes } from "../../routes/roleRoutes";

const OAuthLoginRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithGoogle, ready } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;

    const token = searchParams.get("token");
    if (!token) {
      toast.error("Missing OAuth token.");
      setLoading(false);
      navigate("/login", { replace: true });
      return;
    }

    const handleOAuth = async () => {
      try {
        const user = await loginWithGoogle(token);
        if (!user) throw new Error("Invalid login response");

        const role = (user.role || "user").toLowerCase();
        const redirectPath = roleRoutes[role] || "/user";

        window.history.replaceState({}, document.title, "/");

        setTimeout(() => {
          toast.success(`Welcome, ${user.name || "User"}! 🎉`);
          navigate(redirectPath, { replace: true });
        }, 50);
      } catch (err) {
        console.error(err);
        toast.error(err?.message || "Login failed via Google.");
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    handleOAuth();
  }, [ready, searchParams, loginWithGoogle, navigate]);

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Logging in with Google...</div>;
  return null;
};

export default OAuthLoginRedirect;
