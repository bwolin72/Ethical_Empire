// src/components/Auth/OAuthLoginRedirect.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OAuthLoginRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("Missing OAuth token.");
      setLoading(false);
      navigate("/login");
      return;
    }

    const doLogin = async () => {
      try {
        const user = await loginWithGoogle(token);

        // redirect based on role
        const role = user?.role?.toLowerCase();
        switch (role) {
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
        setError("Login failed. Please try again.");
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    doLogin();
  }, [searchParams, loginWithGoogle, navigate]);

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Logging in with Google...</p>
      </div>
    );

  if (error)
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
        <p>{error}</p>
      </div>
    );

  return null;
}
