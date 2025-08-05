// src/api/axiosInstance.js

import axios from 'axios';
import baseURL from './baseURL';
import { applyCommonRequestHeaders, devLog as rawDevLog } from './axiosCommon';
import { logoutHelper } from '../utils/authUtils';
import { getCookie } from '../utils/csrf'; // ✅ Include CSRF util

const MAX_RETRIES = 2;

const devLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    rawDevLog(...args);
  }
};

const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true, // ✅ Required for CSRF cookies to be sent
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    config = applyCommonRequestHeaders(config, true);
    devLog('[Request]', config.method?.toUpperCase(), config.url, config);

    if (!config.metadata) config.metadata = { retryCount: 0 };

    const rememberStored = localStorage.getItem('remember');
    const remember = rememberStored === null ? true : rememberStored === 'true';
    const storage = remember ? localStorage : sessionStorage;

    const token = storage.getItem('access');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      devLog('[Auth] Using', remember ? 'localStorage' : 'sessionStorage', 'Access:', token?.slice(0, 20) + '...');
    }

    // ✅ Attach CSRF token for unsafe methods
    const method = config.method?.toUpperCase();
    const csrfToken = getCookie('csrftoken');
    const unsafeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (unsafeMethods.includes(method) && csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
      devLog('[CSRF] Attached token:', csrfToken.slice(0, 10) + '...');
    }

    return config;
  },
  (error) => {
    devLog('[Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    devLog('[Response]', response.status, response.config.url, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;

    const rememberStored = localStorage.getItem('remember');
    const remember = rememberStored === null ? true : rememberStored === 'true';
    const storage = remember ? localStorage : sessionStorage;

    const refreshToken = storage.getItem('refresh');
    const accessToken = storage.getItem('access');

    devLog('[Error]', status, originalRequest?.url);
    devLog('[Access Expired?]', accessToken?.slice(0, 20) + '...');

    if (!error.response) {
      devLog('[Network Error]', error.message);
      return Promise.reject(error);
    }

    if (error.code === 'ECONNABORTED') {
      devLog('[Timeout Error]', error.message);
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      devLog('[Token] Access expired, attempting refresh...');
      originalRequest._retry = true;

      try {
        if (!refreshToken) {
          devLog('[Token] No refresh token found!');
          throw new Error('No refresh token');
        }

        const refreshUrl =
          process.env.REACT_APP_API_REFRESH_URL || `${baseURL}accounts/token/refresh/`;

        const { data } = await axios.post(refreshUrl, { refresh: refreshToken });
        const newAccess = data.access;

        if (!newAccess) throw new Error('Refresh succeeded but no access token returned');

        devLog('[Token] Refresh successful. New access set.');
        storage.setItem('access', newAccess);
        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('[Token Refresh Error]', refreshError);
        devLog('[Token] Refresh failed. Logging out...');
        logoutHelper();
        return Promise.reject(refreshError);
      }
    }

    const shouldRetry = (
      !originalRequest._retrying &&
      (!error.response || (status >= 500 && status < 600))
    );

    if (shouldRetry && originalRequest.metadata?.retryCount < MAX_RETRIES) {
      originalRequest.metadata.retryCount += 1;
      originalRequest._retrying = true;
      devLog(`[Retry] Attempt ${originalRequest.metadata.retryCount} → ${originalRequest.url}`);
      return axiosInstance(originalRequest);
    }

    if (status === 401) {
      devLog('[Auth] Final 401. Logging out.');
      logoutHelper();
    }

    devLog('[Response Error]', status, originalRequest?.url, error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
