// src/api/axiosInstance.js
import axios from "axios";
import * as Sentry from "@sentry/react";
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

// ===== Storage Helper =====
const getStorage = () => {
  const rememberStored = localStorage.getItem("remember");
  const remember = rememberStored === null ? true : rememberStored === "true";
  return remember ? localStorage : sessionStorage;
};

// ===== Axios Instance =====
const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
});

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

// ===== Retry helper =====
const retryWithBackoff = (fn, delay) =>
  new Promise((resolve) => setTimeout(() => resolve(fn()), delay));

// ===== Request Interceptor =====
axiosInstance.interceptors.request.use(
  (config) => {
    config = applyCommonRequestHeaders(config, true);
    devLog("[Request]", config.method?.toUpperCase(), config.url);

    if (!config.metadata) config.metadata = { retryCount: 0 };

    const storage = getStorage();
    const token = storage.getItem("access");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;

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
    devLog("[Response]", response.status, response.config.url);
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

    devLog("[Error]", status, originalRequest?.url);

    // === Network Errors ===
    if (!error.response) {
      devLog("[Network Error]", error.message);

      if (originalRequest.metadata.retryCount < MAX_RETRIES) {
        originalRequest.metadata.retryCount += 1;
        const delay =
          500 * 2 ** (originalRequest.metadata.retryCount - 1) +
          Math.random() * 200;

        return retryWithBackoff(
          () => axiosInstance({ ...originalRequest }),
          delay
        );
      }

      Sentry.captureException(error, {
        tags: { type: "network" },
        extra: { url: originalRequest.url },
      });

      return Promise.reject(error);
    }

    // === Timeout ===
    if (error.code === "ECONNABORTED") {
      Sentry.captureException(error, { tags: { type: "timeout" } });
      return Promise.reject(error);
    }

    // === Token Refresh on 401 ===
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!refreshToken) {
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
        if (!newAccess) throw new Error("No access token returned");

        storage.setItem("access", newAccess);
        onTokenRefreshed(newAccess);

        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
        return axiosInstance({ ...originalRequest });
      } catch (refreshError) {
        onTokenRefreshed(null);
        logoutHelper();
        Sentry.captureException(refreshError, {
          tags: { type: "token-refresh" },
        });
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // === Retry on 5xx ===
    if (status >= 500 && status < 600) {
      if (originalRequest.metadata.retryCount < MAX_RETRIES) {
        originalRequest.metadata.retryCount += 1;
        const delay =
          500 * 2 ** (originalRequest.metadata.retryCount - 1) +
          Math.random() * 200;

        return retryWithBackoff(
          () => axiosInstance({ ...originalRequest }),
          delay
        );
      }
    }

    // === Final fallback: 401 logout ===
    if (status === 401) {
      logoutHelper();
    }

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
