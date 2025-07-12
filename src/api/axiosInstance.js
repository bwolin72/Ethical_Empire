import axios from 'axios';
import baseURL from './baseURL';
import { applyCommonRequestHeaders, devLog } from './axiosCommon';
import { logoutHelper } from '../utils/authUtils';

const MAX_RETRIES = 2;

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    config = applyCommonRequestHeaders(config, true);
    devLog('[Private Request]', config.method?.toUpperCase(), config.url, config);
    if (!config.metadata) config.metadata = { retryCount: 0 };
    return config;
  },
  (error) => {
    devLog('[Private Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    devLog('[Private Response]', response.status, response.config.url, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Determine remember mode (default to true if missing)
    const rememberStored = localStorage.getItem('remember');
    const remember = rememberStored === null ? true : rememberStored === 'true';
    const storage = remember ? localStorage : sessionStorage;

    const refreshToken = storage.getItem('refresh');

    // Handle token refresh if 401 and not retried before
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if (!refreshToken) throw new Error('No refresh token');

        const refreshUrl = process.env.REACT_APP_API_REFRESH_URL || `${baseURL}accounts/token/refresh/`;
        const { data } = await axios.post(refreshUrl, { refresh: refreshToken });

        const newAccess = data.access;
        if (!newAccess) throw new Error('No access token returned');

        storage.setItem('access', newAccess);
        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('[Axios] Token refresh failed:', refreshError);
        logoutHelper();
        return Promise.reject(refreshError);
      }
    }

    // Retry on 5xx or network error
    const shouldRetry = (
      !originalRequest._retrying &&
      (!error.response || (status >= 500 && status < 600))
    );

    if (shouldRetry && originalRequest.metadata?.retryCount < MAX_RETRIES) {
      originalRequest.metadata.retryCount += 1;
      originalRequest._retrying = true;
      devLog(`[Retrying ${originalRequest.metadata.retryCount}/${MAX_RETRIES}]`, originalRequest.url);
      return axiosInstance(originalRequest);
    }

    // Final fallback on unauthorized
    if (status === 401) logoutHelper();

    devLog('[Private Response Error]', status, originalRequest?.url, error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
