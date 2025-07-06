import axios from 'axios';
import baseURL from './baseURL';
import { applyCommonRequestHeaders, devLog } from './axiosCommon';
import { logoutHelper } from '../utils/authUtils'; // ✅ Replace useContext with this

const MAX_RETRIES = 2;

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000, // 10 seconds
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    config = applyCommonRequestHeaders(config, true);
    devLog('[Private Request]', config.method?.toUpperCase(), config.url, config);
    config.metadata = { retryCount: 0 }; // for retry logic
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

    // Auto-refresh if token expired (401) and not already retried
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(
          process.env.REACT_APP_API_REFRESH_URL || `${baseURL}auth/token/refresh/`,
          { refresh: refreshToken }
        );

        const newToken = response.data.access || response.data.token;
        localStorage.setItem('token', newToken);

        originalRequest.headers['Authorization'] = `Token ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        logoutHelper(); // 🔁 Use logoutHelper instead of React hook
        return Promise.reject(refreshError);
      }
    }

    // Retry on network or 5xx errors
    const shouldRetry = !originalRequest._retrying && (
      !error.response || (status >= 500 && status < 600)
    );

    if (shouldRetry && originalRequest.metadata.retryCount < MAX_RETRIES) {
      originalRequest.metadata.retryCount += 1;
      originalRequest._retrying = true;
      devLog(`[Retrying ${originalRequest.metadata.retryCount}/${MAX_RETRIES}]`, originalRequest.url);
      return axiosInstance(originalRequest);
    }

    // Final fallback
    if (status === 401) {
      logoutHelper(); // 🔁 Consistent logout
    }

    devLog('[Private Response Error]', status, originalRequest?.url, error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
