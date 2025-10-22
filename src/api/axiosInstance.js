// ==========================================================
// 📁 src/api/axiosInstance.js
// Enhanced global Axios instance with token refresh handling,
// retry logic, Sentry integration, and session management.
// ==========================================================

import axios from "axios";
import * as Sentry from "@sentry/react";
import baseURL from "./baseURL";
import { applyCommonRequestHeaders, devLog as rawDevLog } from "./axiosCommon";
import { logoutHelper } from "../utils/logoutHelper";
import {
  getStorage,
  getAccessToken,
  getRefreshToken,
  AUTH_KEYS,
} from "../utils/authUtils";

const MAX_RETRIES = 2;

/* ----------------------------- DEV LOGGER ----------------------------- */
const devLog = (...args) => {
  if (process.env.NODE_ENV === "development") rawDevLog(...args);
};

/* ---------------------------- AXIOS INSTANCE -------------------------- */
const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
});

/* --------------------------- REFRESH MANAGEMENT ----------------------- */
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (newAccess) => {
  refreshSubscribers.forEach((cb) => cb(newAccess));
  refreshSubscribers = [];
};

/* ----------------------------- RETRY HELPER --------------------------- */
const retryWithBackoff = (fn, delay) =>
  new Promise((resolve) => setTimeout(() => resolve(fn()), delay));

/* -------------------------- REQUEST INTERCEPTOR ----------------------- */
axiosInstance.interceptors.request.use(
  (config) => {
    config = applyCommonRequestHeaders(config, true);
    devLog("[HTTP Request]", config.method?.toUpperCase(), config.url);

    if (!config.metadata) config.metadata = { retryCount: 0 };

    const token = getAccessToken();
    if (token) config.headers["Authorization"] = `Bearer ${token}`;

    return config;
  },
  (error) => {
    devLog("[HTTP Request Error]", error);
    return Promise.reject(error);
  }
);

/* ------------------------- RESPONSE INTERCEPTOR ----------------------- */
axiosInstance.interceptors.response.use(
  (response) => {
    devLog("[HTTP Response]", response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config || {};
    if (!originalRequest.metadata) originalRequest.metadata = { retryCount: 0 };

    const status = error.response?.status;
    const storage = getStorage();
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    devLog("[HTTP Error]", status, originalRequest?.url);

    /* -------------------- NETWORK OR CORS ERRORS -------------------- */
    if (!error.response) {
      devLog("[Network Error]", error.message);

      if (originalRequest.metadata.retryCount < MAX_RETRIES) {
        originalRequest.metadata.retryCount += 1;
        const delay =
          500 * 2 ** (originalRequest.metadata.retryCount - 1) +
          Math.random() * 200;
        return retryWithBackoff(() => axiosInstance({ ...originalRequest }), delay);
      }

      Sentry.captureException(error, {
        tags: { type: "network" },
        extra: { url: originalRequest.url },
      });
      return Promise.reject(error);
    }

    /* ---------------------------- TIMEOUT ---------------------------- */
    if (error.code === "ECONNABORTED") {
      Sentry.captureException(error, { tags: { type: "timeout" } });
      return Promise.reject(error);
    }

    /* ------------------------ TOKEN REFRESH -------------------------- */
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Guest request → reject silently
      if (!accessToken) {
        devLog("[Auth] Guest 401 → ignored");
        return Promise.reject(error);
      }

      // Missing refresh → logout
      if (!refreshToken) {
        devLog("[Auth] No refresh token → logging out");
        await logoutHelper();
        return Promise.reject(error);
      }

      // Wait for ongoing refresh
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newAccess) => {
            if (newAccess) {
              originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
              resolve(axiosInstance({ ...originalRequest }));
            } else {
              reject(error);
            }
          });
        });
      }

      // Perform refresh
      isRefreshing = true;
      try {
        const refreshUrl =
          process.env.REACT_APP_API_REFRESH_URL ||
          `${baseURL}/api/accounts/token/refresh/`;

        const { data } = await axios.post(
          refreshUrl,
          { refresh: refreshToken },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        const newAccess = data?.access;
        if (!newAccess) throw new Error("No access token returned from refresh");

        storage.setItem(AUTH_KEYS.ACCESS, newAccess);
        onTokenRefreshed(newAccess);

        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
        return axiosInstance({ ...originalRequest });
      } catch (refreshError) {
        onTokenRefreshed(null);
        devLog("[Auth] Refresh failed → logging out");
        await logoutHelper();

        Sentry.captureException(refreshError, {
          tags: { type: "token-refresh" },
        });
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    /* ---------------------- RETRY FOR 5xx --------------------------- */
    if (status >= 500 && status < 600) {
      if (originalRequest.metadata.retryCount < MAX_RETRIES) {
        originalRequest.metadata.retryCount += 1;
        const delay =
          500 * 2 ** (originalRequest.metadata.retryCount - 1) +
          Math.random() * 200;
        return retryWithBackoff(() => axiosInstance({ ...originalRequest }), delay);
      }
    }

    /* ----------------------- FINAL 401 HANDLING ---------------------- */
    if (status === 401) {
      const isAuthEndpoint = [
        "/token",
        "/login",
        "/logout",
        "/accounts/token",
      ].some((segment) => originalRequest?.url?.includes(segment));

      if (accessToken && isAuthEndpoint) {
        devLog("[Auth] Final 401 on auth endpoint → logout");
        await logoutHelper();
      } else {
        devLog("[Auth] 401 on non-auth endpoint → ignoring");
      }
    }

    /* -------------------------- CAPTURE OTHERS ----------------------- */
    Sentry.captureException(error, {
      tags: { type: "http-error" },
      extra: {
        url: originalRequest?.url,
        status,
        method: originalRequest?.method,
      },
    });

    return Promise.reject(error);
  }
);

export default axiosInstance;
