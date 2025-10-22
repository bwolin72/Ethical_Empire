// src/components/Auth/OAuthLoginRedirect.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import authService from "../../api/services/authService";

export default function OAuthLoginRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithGoogle } = useAuth();
  const [status, setStatus] = useState({ loading: true, error: null });

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus({ loading: false, error: "Missing OAuth token." });
      navigate("/login", { replace: true });
      return;
    }

    const handleOAuth = async () => {
      try {
        // Step 1: Authenticate via your AuthContext (this should call authService.googleLogin)
        const user = await loginWithGoogle(token);

        // Step 2: If the above didn’t return a role, fetch it explicitly
        let role = user?.role;
        if (!role) {
          try {
            const roleRes = await authService.currentUserRole();
            role = roleRes?.data?.role || roleRes?.role;
          } catch (roleErr) {
            console.warn("Could not fetch role:", roleErr);
          }
        }

        // Step 3: Navigate based on role
        switch (role?.toLowerCase()) {
          case "admin":
            navigate("/admin", { replace: true });
            break;
          case "vendor":
            navigate("/vendor-profile", { replace: true });
            break;
          case "partner":
            navigate("/partner-dashboard", { replace: true });
            break;
          case "worker":
            navigate("/worker-dashboard", { replace: true });
            break;
          default:
            navigate("/user", { replace: true });
        }
      } catch (err) {
        console.error("[OAuthLoginRedirect] Login failed:", err);

        // Handle token invalid or expired
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Login failed. Please try again.";

        setStatus({ loading: false, error: msg });
        navigate("/login", { replace: true });
      } finally {
        setStatus((prev) => ({ ...prev, loading: false }));
      }
    };

    handleOAuth();
  }, [searchParams, loginWithGoogle, navigate]);

  if (status.loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Logging in with Google...</p>
      </div>
    );

  if (status.error)
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
        <p>{status.error}</p>
      </div>
    );

  return null;
}
