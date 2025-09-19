// src/utils/logoutHelper.js

import { toast } from "react-hot-toast";
import authAPI from "../api/authAPI"; // centralized auth API methods

// Keys that might hold auth/session info
const AUTH_KEYS = ["access", "refresh", "user", "remember", "authData"];

/**
 * Unified logout helper
 * 1. Attempts server-side logout if access token exists
 * 2. Clears localStorage and sessionStorage (all auth keys)
 * 3. Provides user feedback via toast (or console in dev)
 * 4. Redirects safely to /login (or custom URL)
 */
export const logoutHelper = async (redirectUrl = "/login") => {
  const access =
    localStorage.getItem("access") || sessionStorage.getItem("access");
  let didServerLogout = false;

  try {
    if (access) {
      await authAPI.logout();
      didServerLogout = true;

      if (process.env.NODE_ENV === "development") {
        console.log("[Logout] ✅ Server logout successful.");
      } else {
        toast.success("✅ You have been logged out from the server.");
      }
    } else {
      console.log("[Logout] No access token found, skipping server logout.");
    }
  } catch (err) {
    console.warn(
      "[Logout] Server logout failed:",
      err?.response?.status,
      err?.response?.data
    );

    if (!didServerLogout) {
      if (process.env.NODE_ENV === "development") {
        console.log("⚠️ Server logout failed. Logging out locally.");
      } else {
        toast.error("⚠️ Could not log out from server. Logging out locally.");
      }
    }
  } finally {
    // Clear all stored auth/session data
    AUTH_KEYS.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    sessionStorage.clear();

    // Final logout feedback
    if (process.env.NODE_ENV === "development") {
      console.log("[Logout] 👋 You have been logged out.");
    } else {
      toast.success("👋 You have been logged out.");
    }

    // Redirect safely to login (or custom URL)
    if (!window.location.pathname.includes("/login")) {
      setTimeout(() => {
        window.location.replace(redirectUrl);
      }, 400);
    }
  }
};
