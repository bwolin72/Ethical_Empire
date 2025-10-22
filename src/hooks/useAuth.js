// ================================================
// 📁 src/hooks/useAuth.js
// ================================================
import { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import { clearSession } from "../utils/authUtils";
import jwt_decode from "jwt-decode";

// ==============================
// 🔧 Constants & Helpers
// ==============================
const AUTH_KEYS = {
  ACCESS: "access",
  REFRESH: "refresh",
  USER: "user",
  REMEMBER: "remember",
};

const VALID_ROLES = ["admin", "user", "vendor", "partner"];
const normalizeRole = (role) => role?.trim()?.toLowerCase();
const isValidRole = (role) => VALID_ROLES.includes(normalizeRole(role));

const safeGet = (storage, key) => {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (storage, key, value) => {
  try {
    storage.setItem(key, value);
  } catch {}
};

const getStorage = (remember) => {
  if (remember === false || localStorage.getItem(AUTH_KEYS.REMEMBER) === "false")
    return sessionStorage;
  return localStorage;
};

const clampDelay = (ms) => Math.min(Math.max(Number.isFinite(ms) ? ms : 5000, 5000), 3600000);

// ==============================
// 🔒 useAuth Hook
// ==============================
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const refreshTimer = useRef(null);

  // ------------------------------
  // 🧹 Helpers
  // ------------------------------
  const logout = useCallback(() => {
    console.warn("[Auth] Logging out...");
    clearSession();
    setUser(null);
    setIsAuthenticated(false);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
  }, []);

  const scheduleTokenRefresh = useCallback(
    (access, refresh) => {
      if (!access || !refresh) return;

      try {
        const { exp } = jwt_decode(access);
        const delay = clampDelay(exp * 1000 - Date.now() - 60_000); // refresh 1m before expiry

        if (refreshTimer.current) clearTimeout(refreshTimer.current);

        if (delay <= 0) refreshAccessToken(refresh);
        else refreshTimer.current = setTimeout(() => refreshAccessToken(refresh), delay);
      } catch (err) {
        console.error("[Auth] Failed to decode access token:", err);
        logout();
      }
    },
    [logout]
  );

  // ------------------------------
  // ♻️ Token refresh
  // ------------------------------
  const refreshAccessToken = useCallback(
    async (refresh) => {
      if (!refresh) return logout();

      try {
        const { data } = await axiosInstance.post(
          process.env.REACT_APP_API_REFRESH_URL || "/accounts/token/refresh/",
          { refresh }
        );

        if (!data?.access) throw new Error("Invalid refresh response");

        const storage = getStorage();
        safeSet(storage, AUTH_KEYS.ACCESS, data.access);

        scheduleTokenRefresh(data.access, refresh);
        return data.access;
      } catch (err) {
        console.error("[Auth] Refresh token failed:", err);
        logout();
      }
    },
    [logout, scheduleTokenRefresh]
  );

  // ------------------------------
  // 🔑 Login
  // ------------------------------
  const login = useCallback(({ access, refresh, user: userData, remember = true }) => {
    if (!access || !refresh || !userData) {
      console.warn("[Auth] Invalid login payload");
      return;
    }

    const storage = getStorage(remember);

    const normalizedRole = normalizeRole(userData.role);
    const cleanUser = {
      ...userData,
      role: isValidRole(normalizedRole) ? normalizedRole : "user",
    };

    safeSet(localStorage, AUTH_KEYS.REMEMBER, remember ? "true" : "false");
    safeSet(storage, AUTH_KEYS.ACCESS, access);
    safeSet(storage, AUTH_KEYS.REFRESH, refresh);
    safeSet(storage, AUTH_KEYS.USER, JSON.stringify(cleanUser));

    setUser(cleanUser);
    setIsAuthenticated(true);

    scheduleTokenRefresh(access, refresh);
  }, [scheduleTokenRefresh]);

  // ------------------------------
  // 🚪 Logout (public)
  // ------------------------------
  const handleLogout = useCallback(() => logout(), [logout]);

  // ------------------------------
  // 🧭 Initialize on mount
  // ------------------------------
  useEffect(() => {
    const storage = getStorage();
    const access = safeGet(storage, AUTH_KEYS.ACCESS);
    const refresh = safeGet(storage, AUTH_KEYS.REFRESH);
    const userRaw = safeGet(storage, AUTH_KEYS.USER);

    if (!access || !refresh || !userRaw) {
      setIsLoaded(true);
      setIsAuthenticated(false);
      return;
    }

    try {
      const parsed = JSON.parse(userRaw);
      const normalizedRole = normalizeRole(parsed.role);
      const cleanUser = {
        ...parsed,
        role: isValidRole(normalizedRole) ? normalizedRole : "user",
      };

      const { exp } = jwt_decode(access);
      const isExpired = exp * 1000 < Date.now();

      setUser(cleanUser);
      setIsAuthenticated(!isExpired);

      if (isExpired) refreshAccessToken(refresh);
      else scheduleTokenRefresh(access, refresh);
    } catch (err) {
      console.error("[Auth] Initialization failed:", err);
      logout();
    } finally {
      setIsLoaded(true);
    }

    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [refreshAccessToken, scheduleTokenRefresh, logout]);

  // ------------------------------
  // Derived state
  // ------------------------------
  const role = user?.role || null;

  // ------------------------------
  // 🔁 Sync user profile
  // ------------------------------
  const syncProfile = useCallback(async () => {
    const storage = getStorage();
    const access = safeGet(storage, AUTH_KEYS.ACCESS);
    if (!access) return;

    try {
      const { data } = await axiosInstance.get("/accounts/profile/", {
        headers: { Authorization: `Bearer ${access}` },
      });

      if (data) {
        const normalizedRole = normalizeRole(data.role);
        const updatedUser = {
          ...data,
          role: isValidRole(normalizedRole) ? normalizedRole : "user",
        };
        safeSet(storage, AUTH_KEYS.USER, JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (err) {
      console.error("[Auth] Profile sync failed:", err);
      const status = err?.response?.status;
      if (status === 401) {
        const refresh = safeGet(storage, AUTH_KEYS.REFRESH);
        if (refresh) await refreshAccessToken(refresh);
        else logout();
      }
    }
  }, [refreshAccessToken, logout]);

  // ==============================
  // 🔚 Return API
  // ==============================
  return {
    user,
    role,
    isAuthenticated,
    isLoaded,
    login,
    logout: handleLogout,
    syncProfile,
  };
};

export default useAuth;
