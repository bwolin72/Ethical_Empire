// src/utils/logoutHelper.js

import { toast } from "react-hot-toast";
import authAPI from "../api/authAPI"; // centralized auth API methods

const AUTH_KEYS = ["access", "refresh", "user", "remember"];

/**
 * Logs out the user by:
 * 1. Attempting a server-side logout if access token is present
 * 2. Clearing both localStorage and sessionStorage
 * 3. Redirecting to /login after a short delay
 */
export const logoutHelper = async () => {
  const access =
    localStorage.getItem("access") || sessionStorage.getItem("access");
  let didServerLogout = false;

  try {
    if (access) {
      // Attempt backend logout via authAPI
      await authAPI.logout();
      didServerLogout = true;
      console.log("[Logout] Server logout successful.");
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
      toast.error("⚠️ Could not log out from server. Logging out locally.");
    }
  } finally {
    // Clear stored auth/session data
    AUTH_KEYS.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // Show unified logout toast
    toast.success("👋 You have been logged out.");

    // Redirect if not already on the login page
    if (!window.location.pathname.includes("/login")) {
      setTimeout(() => {
        window.location.href = "/login";
      }, 600);
    }
  }
};
