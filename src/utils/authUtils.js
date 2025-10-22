// ================================================
// 📁 src/utils/authUtils.js
// ================================================

/**
 * Keys used across storage for authentication
 */
export const AUTH_KEYS = {
  ACCESS: "access",
  REFRESH: "refresh",
  USER: "user",
  REMEMBER: "remember",
  LAST_SYNC: "lastSyncedAt",
};

/**
 * Safe wrapper around local/sessionStorage
 */
export const safeStorage = {
  get(storage, key) {
    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  },

  set(storage, key, value) {
    try {
      storage.setItem(key, value);
    } catch {}
  },

  remove(storage, key) {
    try {
      storage.removeItem(key);
    } catch {}
  },
};

/**
 * Determines which storage to use (local or session)
 * based on the user's "remember me" setting.
 */
export const getStorage = () => {
  if (typeof window === "undefined") return sessionStorage;
  const remember = safeStorage.get(localStorage, AUTH_KEYS.REMEMBER) === "true";
  return remember ? localStorage : sessionStorage;
};

/**
 * Completely clears both local and session storage
 * for all auth-related keys.
 */
export const clearSession = () => {
  try {
    Object.values(AUTH_KEYS).forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  } catch (err) {
    console.error("[AuthUtils] Failed to clear session:", err);
  }
};

/**
 * Extracts stored access token (if any)
 */
export const getAccessToken = () => {
  const storage = getStorage();
  return safeStorage.get(storage, AUTH_KEYS.ACCESS);
};

/**
 * Extracts stored refresh token (if any)
 */
export const getRefreshToken = () => {
  const storage = getStorage();
  return safeStorage.get(storage, AUTH_KEYS.REFRESH);
};

/**
 * Extracts stored user object (if any)
 */
export const getStoredUser = () => {
  const storage = getStorage();
  const userRaw = safeStorage.get(storage, AUTH_KEYS.USER);
  try {
    return userRaw ? JSON.parse(userRaw) : null;
  } catch {
    return null;
  }
};

/**
 * Persists a user object to storage
 */
export const setStoredUser = (user) => {
  const storage = getStorage();
  safeStorage.set(storage, AUTH_KEYS.USER, JSON.stringify(user));
};
