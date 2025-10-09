// src/utils/logoutHelper.js

import { toast } from "react-hot-toast";
import authAPI from "../api/authAPI"; // centralized auth API methods

// Keys that may store auth/session information
const AUTH_KEYS = ["access", "refresh", "user", "remember", "authData"];

/**
 * Unified logout helper
 * Handles both server-side logout and local cleanup.
 * @param {string} redirectUrl - URL to redirect after logout (default: /login)
 * @param {boolean} silent - If true, suppress toasts (useful for token expiry)
 */
export const logoutHelper = async (redirectUrl = "/login", silent = false) => {
  const access =
    localStorage.getItem("access") || sessionStorage.getItem("access");
  let didServerLogout = false;

  try {
    // ===== 1️⃣ Attempt server-side logout =====
    if (access && authAPI?.logout) {
      await authAPI.logout();
      didServerLogout = true;

      if (!silent) {
        if (process.env.NODE_ENV === "development") {
          console.log("[Logout] ✅ Server logout successful.");
        } else {
          toast.success("✅ Logged out from server.");
        }
      }
    } else {
      if (process.env.NODE_ENV === "development") {
        console.log("[Logout] ℹ️ No access token, skipping server logout.");
      }
    }
  } catch (err) {
    console.warn(
      "[Logout] ⚠️ Server logout failed:",
      err?.response?.status,
      err?.response?.data
    );

    if (!didServerLogout && !silent) {
      if (process.env.NODE_ENV === "development") {
        console.log("⚠️ Server logout failed. Logging out locally.");
      } else {
        toast.error("⚠️ Could not log out from server. Logging out locally.");
      }
    }
  } finally {
    // ===== 2️⃣ Local cleanup =====
    try {
      AUTH_KEYS.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      sessionStorage.clear();
    } catch (clearError) {
      console.warn("[Logout] Storage clear error:", clearError);
    }

    if (!silent) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Logout] 👋 Local session cleared.");
      } else {
        toast.success("👋 You have been logged out.");
      }
    }

    // ===== 3️⃣ Safe redirect =====
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      setTimeout(() => {
        try {
          window.location.replace(redirectUrl);
        } catch (e) {
          console.warn("[Logout] Redirect failed:", e);
        }
      }, 400);
    }
  }
};
