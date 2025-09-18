// src/api/axiosInstance.js
import axios from "axios";
import * as Sentry from "@sentry/react"; // 👈 add Sentry
import baseURL from "./baseURL";
import { applyCommonRequestHeaders, devLog as rawDevLog } from "./axiosCommon";
import { logoutHelper } from "../utils/authUtils";

const MAX_RETRIES = 2;

// ===== Development logger =====
const devLog = (...args) => {
  if (process.env.NODE_ENV === "development") {
    rawDevLog(...args);
  }
};

// ===== Create axios instance =====
const axiosInstance = axios.create({
  baseURL,
  timeout: 30000, // 30 seconds
  withCredentials: true,
});

// ===== Storage Helper =====
const getStorage = () => {
  const rememberStored = localStorage.getItem("remember");
  const remember = rememberStored === null ? true : rememberStored === "true";
  return remember ? localStorage : sessionStorage;
};

// ===== Refresh Token Queue =====
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (newAccess) => {
  refreshSubscribers.forEach((cb) => cb(newAccess));
  refreshSubscribers = [];
};

// ===== Retry helper with exponential backoff + jitter =====
const retryWithBackoff = (fn, delay) =>
  new Promise((resolve) => setTimeout(() => resolve(fn()), delay));

// ===== Request Interceptor =====
axiosInstance.interceptors.request.use(
  (config) => {
    config = applyCommonRequestHeaders(config, true);
    devLog("[Request]", config.method?.toUpperCase(), config.url, config);

    if (!config.metadata) config.metadata = { retryCount: 0 };

    const storage = getStorage();
    const token = storage.getItem("access");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    devLog("[Request Error]", error);
    return Promise.reject(error);
  }
);

// ===== Response Interceptor =====
axiosInstance.interceptors.response.use(
  (response) => {
    devLog("[Response]", response.status, response.config.url, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config || {};
    if (!originalRequest.metadata) {
      originalRequest.metadata = { retryCount: 0 };
    }

    const status = error.response?.status;
    const storage = getStorage();
    const refreshToken = storage.getItem("refresh");
    const accessToken = storage.getItem("access");

    devLog("[Error]", status, originalRequest?.url);

    // ===== Network error (no response at all) =====
    if (!error.response) {
      devLog("[Network Error]", error.message);

      if (originalRequest.metadata.retryCount < MAX_RETRIES) {
        originalRequest.metadata.retryCount += 1;
        const delay =
          500 * 2 ** (originalRequest.metadata.retryCount - 1) +
          Math.random() * 200;

        devLog(
          `[Retry:Network] Attempt ${originalRequest.metadata.retryCount} after ${delay}ms → ${originalRequest.url}`
        );

        return retryWithBackoff(
          () => axiosInstance({ ...originalRequest }),
          delay
        );
      }

      // Report to Sentry
      Sentry.captureException(error, {
        tags: { type: "network" },
        extra: { url: originalRequest.url },
      });

      return Promise.reject(error);
    }

    // ===== Timeout =====
    if (error.code === "ECONNABORTED") {
      devLog("[Timeout Error]", error.message);
      Sentry.captureException(error, { tags: { type: "timeout" } });
      return Promise.reject(error);
    }

    // ===== Token Refresh on 401 =====
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!refreshToken) {
        devLog("[Token] No refresh token found!");
        logoutHelper();
        return Promise.reject(error);
      }

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

      isRefreshing = true;
      devLog("[Token] Access expired, attempting refresh...");

      try {
        const refreshUrl =
          process.env.REACT_APP_API_REFRESH_URL ||
          `${baseURL}/api/accounts/token/refresh/`;

        const { data } = await axios.post(
          refreshUrl,
          { refresh: refreshToken },
          { withCredentials: true }
        );

        const newAccess = data.access;
        if (!newAccess) {
          throw new Error("Refresh succeeded but no access token returned");
        }

        devLog("[Token] Refresh successful. New access stored.");
        storage.setItem("access", newAccess);
        onTokenRefreshed(newAccess);

        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
        return axiosInstance({ ...originalRequest });
      } catch (refreshError) {
        devLog("[Token Refresh Failed]", refreshError);
        onTokenRefreshed(null);
        logoutHelper();

        // Send to Sentry
        Sentry.captureException(refreshError, {
          tags: { type: "token-refresh" },
        });

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ===== Retry on 5xx errors =====
    if (status >= 500 && status < 600) {
      if (originalRequest.metadata.retryCount < MAX_RETRIES) {
        originalRequest.metadata.retryCount += 1;
        const delay =
          500 * 2 ** (originalRequest.metadata.retryCount - 1) +
          Math.random() * 200;

        devLog(
          `[Retry:5xx] Attempt ${originalRequest.metadata.retryCount} after ${delay}ms → ${originalRequest.url}`
        );

        return retryWithBackoff(
          () => axiosInstance({ ...originalRequest }),
          delay
        );
      }
    }

    // ===== Final fallback: logout on persistent 401 =====
    if (status === 401) {
      devLog("[Auth] Final 401. Logging out.");
      logoutHelper();
    }

    // Capture all other errors in Sentry
    Sentry.captureException(error, {
      tags: { type: "http-error" },
      extra: {
        url: originalRequest?.url,
        status,
        method: originalRequest?.method,
      },
    });

    devLog("[Response Error]", status, originalRequest?.url, error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
