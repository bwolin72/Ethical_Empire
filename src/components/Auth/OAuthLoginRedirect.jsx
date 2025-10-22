import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { roleRoutes } from "../../routes/roleRoutes";

export default function OAuthLoginRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithGoogle, ready } = useAuth();
  const [status, setStatus] = useState({ loading: true, error: null });

  useEffect(() => {
    if (!ready) return; // ✅ Wait for AuthContext initialization

    const token = searchParams.get("token");
    if (!token) {
      toast.error("Missing OAuth token.");
      setStatus({ loading: false, error: "Missing OAuth token." });
      navigate("/login", { replace: true });
      return;
    }

    const handleOAuth = async () => {
      try {
        // ✅ Step 1: Login via AuthContext
        const user = await loginWithGoogle(token);
        if (!user) throw new Error("Invalid OAuth login response.");

        // ✅ Step 2: Determine role & safe redirect
        const role = user.role?.toLowerCase() || "user";
        const redirectPath = roleRoutes[role] || "/user";

        // ✅ Step 3: Clean URL before navigation
        window.history.replaceState({}, document.title, "/");

        // ✅ Step 4: Slight delay to ensure auth state propagation
        setTimeout(() => {
          toast.success(`Welcome, ${user.name || "User"}! 🎉`);
          navigate(redirectPath, { replace: true });
        }, 50);
      } catch (err) {
        console.error("[OAuthLoginRedirect] Login failed:", err);
        const errorMessage = err?.message || "Login failed via Google.";
        toast.error(errorMessage);
        setStatus({ loading: false, error: errorMessage });
        navigate("/login", { replace: true });
      } finally {
        setStatus((prev) => ({ ...prev, loading: false }));
      }
    };

    handleOAuth();
  }, [ready, searchParams, loginWithGoogle, navigate]);

  if (status.loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Logging in with Google...</p>
      </div>
    );
  }

  if (status.error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
        <p>{status.error}</p>
        <button
          onClick={() => navigate("/login")}
          style={{
            marginTop: "1rem",
            padding: "0.6rem 1.2rem",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Go back to Login
        </button>
      </div>
    );
  }

  return null;
}
