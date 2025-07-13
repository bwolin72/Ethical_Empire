import axios from 'axios';
import baseURL from './baseURL';
import { applyCommonRequestHeaders, devLog } from './axiosCommon';
import { logoutHelper } from '../utils/authUtils';

const MAX_RETRIES = 2;

const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
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
    devLog('[Auth] Using', remember ? 'localStorage' : 'sessionStorage', 'Access:', token?.slice(0, 20) + '...');

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
    const originalRequest = error.config;
    const status = error.response?.status;

    const rememberStored = localStorage.getItem('remember');
    const remember = rememberStored === null ? true : rememberStored === 'true';
    const storage = remember ? localStorage : sessionStorage;

    const refreshToken = storage.getItem('refresh');
    devLog('[Error]', status, originalRequest?.url);
    devLog('[Access Expired?]', storage.getItem('access')?.slice(0, 20) + '...');

    // Handle 401 with token refresh
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

    // Retry for server/network errors
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

    // Final fallback for persistent 401
    if (status === 401) {
      devLog('[Auth] Final 401. Logging out.');
      logoutHelper();
    }

    devLog('[Response Error]', status, originalRequest?.url, error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
