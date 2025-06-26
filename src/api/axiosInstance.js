// src/api/axiosInstance.js
import axios from 'axios';

let baseURL = process.env.REACT_APP_API_BASE_URL;

if (process.env.NODE_ENV === 'development' && !baseURL) {
  baseURL = 'http://localhost:8000/api/';
} else if (!baseURL) {
  baseURL = 'https://ethical-backend-production.up.railway.app/api/';
}

// Ensure trailing slash
if (!baseURL.endsWith('/')) baseURL += '/';

const axiosInstance = axios.create({
  baseURL,
});

// === Request Interceptor ===
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');

    if (token && token !== 'undefined' && token !== 'null' && token.length > 10) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      delete config.headers['Authorization']; // Clean up bad tokens
    }

    const isFormData = config.data instanceof FormData;

    if (config.method?.toUpperCase() !== 'GET' && !isFormData) {
      config.headers['Content-Type'] = 'application/json';
    } else if (config.method?.toUpperCase() === 'GET') {
      delete config.headers['Content-Type']; // GET should not send Content-Type
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[AxiosInstance Request]', config.method?.toUpperCase(), config.url, config);
    }

    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[AxiosInstance Request Error]', error);
    }
    return Promise.reject(error);
  }
);

// === Response Interceptor ===
axiosInstance.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[AxiosInstance Response]', response.status, response.config.url, response.data);
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[AxiosInstance Response Error]', error?.response?.status, error?.response?.config?.url, error);
    }

    // Optional: Global auth expiration handling
    // if (error.response?.status === 401) {
    //   // logout(), redirect to /login, etc.
    // }

    return Promise.reject(error);
  }
);

export default axiosInstance;
