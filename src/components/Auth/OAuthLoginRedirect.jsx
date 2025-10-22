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
    if (!ready) return; // wait for AuthContext to initialize

    const token = searchParams.get("token");
    if (!token) {
      setStatus({ loading: false, error: "Missing OAuth token." });
      navigate("/login", { replace: true });
      return;
    }

    const handleOAuth = async () => {
      try {
        // Step 1: Login via AuthContext
        const user = await loginWithGoogle(token);

        if (!user) throw new Error("Invalid OAuth login response.");

        // Step 2: Ensure role exists
        let role = user.role?.toLowerCase() || "user";

        // Step 3: Navigate safely
        const redirectPath = roleRoutes[role] || "/user";

        // Clear token from URL before navigation
        window.history.replaceState({}, document.title, "/");

        toast.success(`Welcome, ${user.name || "User"}! 🎉`);
        navigate(redirectPath, { replace: true });
      } catch (err) {
        console.error("[OAuthLoginRedirect] Login failed:", err);
        setStatus({ loading: false, error: err?.message || "Login failed" });
        toast.error(err?.message || "Login failed via Google.");
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
