// src/api/axiosInstance.js

import axios from 'axios';
import baseURL from './baseURL';
import { applyCommonRequestHeaders, devLog as rawDevLog } from './axiosCommon';
import { logoutHelper } from '../utils/authUtils';

const MAX_RETRIES = 2;

// Only log in development
const devLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    rawDevLog(...args);
  }
};

const axiosInstance = axios.create({
  baseURL,
  timeout: 30000, // 30 seconds
});

// Helper to get token storage based on "remember" choice
const getStorage = () => {
  const rememberStored = localStorage.getItem('remember');
  const remember = rememberStored === null ? true : rememberStored === 'true';
  return remember ? localStorage : sessionStorage;
};

// ===== Request Interceptor =====
axiosInstance.interceptors.request.use(
  (config) => {
    config = applyCommonRequestHeaders(config, true);
    devLog('[Request]', config.method?.toUpperCase(), config.url, config);

    if (!config.metadata) config.metadata = { retryCount: 0 };

    const storage = getStorage();
    const token = storage.getItem('access');

    devLog('[Auth] Using', storage === localStorage ? 'localStorage' : 'sessionStorage', 'Access:', token?.slice(0, 20) + '...');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    devLog('[Request Error]', error);
    return Promise.reject(error);
  }
);

// ===== Response Interceptor =====
axiosInstance.interceptors.response.use(
  (response) => {
    devLog('[Response]', response.status, response.config.url, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const storage = getStorage();
    const refreshToken = storage.getItem('refresh');
    const accessToken = storage.getItem('access');

    devLog('[Error]', status, originalRequest?.url);
    devLog('[Access Token]', accessToken?.slice(0, 20) + '...');

    // Network error
    if (!error.response) {
      devLog('[Network Error]', error.message);
      return Promise.reject(error);
    }

    // Timeout
    if (error.code === 'ECONNABORTED') {
      devLog('[Timeout Error]', error.message);
      return Promise.reject(error);
    }

    // Attempt token refresh on 401
    if (status === 401 && !originalRequest._retry) {
      devLog('[Token] Access expired, attempting refresh...');
      originalRequest._retry = true;

      try {
        if (!refreshToken) {
          devLog('[Token] No refresh token found!');
          throw new Error('No refresh token');
        }

        const refreshUrl = process.env.REACT_APP_API_REFRESH_URL || `${baseURL}accounts/token/refresh/`;
        const { data } = await axios.post(refreshUrl, { refresh: refreshToken });
        const newAccess = data.access;

        if (!newAccess) throw new Error('Refresh succeeded but no access token returned');

        devLog('[Token] Refresh successful. New access stored.');
        storage.setItem('access', newAccess);
        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        devLog('[Token Refresh Failed]', refreshError);
        logoutHelper();
        return Promise.reject(refreshError);
      }
    }

    // Retry server/network errors (5xx)
    const shouldRetry = !originalRequest._retrying && status >= 500 && status < 600;
    if (shouldRetry && originalRequest.metadata?.retryCount < MAX_RETRIES) {
      originalRequest.metadata.retryCount += 1;
      originalRequest._retrying = true;
      devLog(`[Retry] Attempt ${originalRequest.metadata.retryCount} → ${originalRequest.url}`);
      return axiosInstance(originalRequest);
    }

    // Final fallback: logout on persistent 401
    if (status === 401) {
      devLog('[Auth] Final 401. Logging out.');
      logoutHelper();
    }

    devLog('[Response Error]', status, originalRequest?.url, error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
