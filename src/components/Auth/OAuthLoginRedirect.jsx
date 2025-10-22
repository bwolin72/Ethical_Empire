import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import authService from "../../api/services/authService";

export default function OAuthLoginRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithGoogle, ready } = useAuth();
  const [status, setStatus] = useState({ loading: true, error: null });

  useEffect(() => {
    if (!ready) return; // wait until AuthContext is initialized

    const token = searchParams.get("token");
    if (!token) {
      setStatus({ loading: false, error: "Missing OAuth token." });
      navigate("/login", { replace: true });
      return;
    }

    const handleOAuth = async () => {
      try {
        // Step 1: Authenticate via AuthContext
        const user = await loginWithGoogle(token);

        // Step 2: Ensure role exists
        let role = user?.role;
        if (!role) {
          try {
            const roleRes = await authService.currentUserRole();
            role = roleRes?.data?.role || roleRes?.role;
          } catch (roleErr) {
            console.warn("Could not fetch role:", roleErr);
          }
        }

        // Step 3: Always fallback to 'user'
        role = role ? role.toLowerCase() : "user";

        // Step 4: Navigate based on role
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
        setStatus({ loading: false, error: err?.message || "Login failed" });
        navigate("/login", { replace: true });
      } finally {
        setStatus((prev) => ({ ...prev, loading: false }));
      }
    };

    handleOAuth();
  }, [searchParams, loginWithGoogle, navigate, ready]);

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
