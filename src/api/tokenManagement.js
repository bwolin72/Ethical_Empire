// src/api/tokenManagement.js
// Centralized token utilities to keep axiosInstance and authService in sync

/* =========================
   TOKEN STORAGE HELPERS
========================= */

/**
 * Decide storage based on "remember" flag.
 * Defaults to localStorage if not explicitly set.
 */
export const getStorage = () => {
  const rememberStored = localStorage.getItem("remember");
  const remember = rememberStored === null ? true : rememberStored === "true";
  return remember ? localStorage : sessionStorage;
};

/**
 * Save tokens securely in the correct storage.
 * Optionally persist "remember" flag.
 */
export const saveTokens = ({ access, refresh, remember = true }) => {
  if (!access && !refresh) return;
  if (remember !== undefined) localStorage.setItem("remember", remember);

  const storage = remember ? localStorage : sessionStorage;

  if (access) storage.setItem("access", access);
  if (refresh) storage.setItem("refresh", refresh);
};

/**
 * Clear tokens from both storage types.
 * Ensures logout is absolute.
 */
export const clearTokens = () => {
  for (const key of ["access", "refresh", "remember"]) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
};

/**
 * Retrieve access token regardless of storage type.
 */
export const getAccessToken = () =>
  localStorage.getItem("access") || sessionStorage.getItem("access");

/**
 * Retrieve refresh token regardless of storage type.
 */
export const getRefreshToken = () =>
  localStorage.getItem("refresh") || sessionStorage.getItem("refresh");

/**
 * Helper to detect if user is authenticated.
 */
export const hasValidAccessToken = () => !!getAccessToken();

/**
 * Helper to detect "remember me" mode.
 */
export const isRemembered = () => {
  const rememberStored = localStorage.getItem("remember");
  return rememberStored === null ? true : rememberStored === "true";
};

/* =========================
   TOKEN NORMALIZER
========================= */

/**
 * Normalize backend token responses for consistency.
 * Expected backend formats:
 *  - { tokens: { access, refresh }, user }
 *  - { access, refresh, user }
 *  - { access, refresh }
 */
export const normalizeAuthResponse = (res, remember = true) => {
  let access = null;
  let refresh = null;
  let user = null;

  // Case 1: res.data.tokens
  if (res?.data?.tokens) {
    access = res.data.tokens.access;
    refresh = res.data.tokens.refresh;
    user = res.data.user || null;
  }
  // Case 2: res.data.access + res.data.refresh
  else if (res?.data?.access || res?.data?.refresh) {
    access = res.data.access;
    refresh = res.data.refresh;
    user = res.data.user || null;
  }
  // Case 3: fallback to plain user
  else {
    user = res?.data || null;
  }

  if (access && refresh) {
    saveTokens({ access, refresh, remember });
  }

  return { tokens: { access, refresh }, user };
};

export default {
  getStorage,
  saveTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  normalizeAuthResponse,
  hasValidAccessToken,
  isRemembered,
};
