// src/utils/logoutHelper.js

import { toast } from "react-hot-toast";
import authAPI from "../api/authAPI";

/** Auth/session storage keys */
const AUTH_KEYS = ["access", "refresh", "user", "remember", "authData"];

/**
 * Unified logout helper.
 * Handles both API logout and full local cleanup.
 * @param {string} redirectUrl - Redirect path after logout (default: "/login")
 * @param {boolean} silent - Suppress UI toasts (used for expired sessions)
 */
export const logoutHelper = async (redirectUrl = "/login", silent = false) => {
  const accessToken =
    localStorage.getItem("access") || sessionStorage.getItem("access");

  let serverLogoutDone = false;

  /* -------------------- 1️⃣ SERVER LOGOUT -------------------- */
  try {
    if (accessToken && typeof authAPI?.logout === "function") {
      await authAPI.logout();
      serverLogoutDone = true;

      if (!silent) {
        if (process.env.NODE_ENV === "development") {
          console.log("[Logout] ✅ Server logout successful");
        } else {
          toast.success("✅ Logged out from server.");
        }
      }
    } else {
      if (process.env.NODE_ENV === "development") {
        console.log("[Logout] ℹ️ No access token or logout endpoint unavailable.");
      }
    }
  } catch (err) {
    console.warn("[Logout] ⚠️ Server logout failed:", err?.response?.status, err?.message);
    if (!serverLogoutDone && !silent) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Logout] Logging out locally (server logout failed).");
      } else {
        toast.error("⚠️ Could not log out from server. Logging out locally.");
      }
    }
  }

  /* -------------------- 2️⃣ LOCAL CLEANUP -------------------- */
  try {
    AUTH_KEYS.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    sessionStorage.clear();

    // Optional: notify other tabs to log out too
    if (typeof window !== "undefined") {
      window.localStorage.setItem("logout-event", Date.now().toString());
    }

    if (!silent) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Logout] 🧹 Local session cleared.");
      } else {
        toast.success("👋 You have been logged out.");
      }
    }
  } catch (clearError) {
    console.warn("[Logout] Storage cleanup failed:", clearError);
  }

  /* -------------------- 3️⃣ SAFE REDIRECT -------------------- */
  try {
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login") &&
      !window.location.pathname.startsWith("/auth")
    ) {
      // Use replace() for hard redirect; avoids SPA state bugs
      setTimeout(() => {
        try {
          window.location.replace(redirectUrl);
        } catch (e) {
          console.warn("[Logout] Redirect failed:", e);
        }
      }, silent ? 0 : 400); // small delay if showing toast
    }
  } catch (redirectError) {
    console.warn("[Logout] Redirect handling error:", redirectError);
  }
};
