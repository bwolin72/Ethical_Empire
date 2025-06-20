// src/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/', // Fallback for local dev
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');

    // ✅ Attach Authorization header if valid token
    if (token && token !== 'undefined' && token !== 'null' && token.length > 10) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      delete config.headers['Authorization']; // Prevent bad header
    }

    // ✅ Apply Content-Type for non-FormData requests
    if (config.data && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    // ✅ Optional: log in dev
    if (process.env.NODE_ENV === 'development') {
      console.log('[Axios Request]', config.method?.toUpperCase(), config.url, config);
    }

    return config;
  },
  (error) => {
    console.error('[Axios Request Error]', error);
    return Promise.reject(error);
  }
);

// Optional: Response Interceptor for logging or retry
axiosInstance.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Axios Response]', response.config.url, response.status, response.data);
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Axios Response Error]', error?.response?.config?.url, error);
    }

    // Example: handle 401 globally
    // if (error.response?.status === 401) {
    //   // Redirect to login or logout user
    // }

    return Promise.reject(error);
  }
);

export default axiosInstance;
