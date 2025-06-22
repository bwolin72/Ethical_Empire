// src/api/publicAxios.js
import axios from 'axios';

// Determine API base URL
let baseURL = process.env.REACT_APP_API_BASE_URL;

if (process.env.NODE_ENV === 'development' && !baseURL) {
  // Fallback to local mock server in dev mode
  baseURL = 'http://localhost:8000/api/';
} else if (!baseURL) {
  baseURL = 'https://ethical-backend.onrender.com/api/';
}

// Ensure trailing slash
if (!baseURL.endsWith('/')) baseURL += '/';

const publicAxios = axios.create({
  baseURL,
});

// Request interceptor for GET vs POST headers
publicAxios.interceptors.request.use(
  (config) => {
    const isFormData = config.data instanceof FormData;

    if (config.method?.toUpperCase() === 'GET') {
      // Clear any accidental content headers on GET
      delete config.headers['Content-Type'];
    } else {
      // Set content type for JSON or preserve FormData
      if (!isFormData) {
        config.headers['Content-Type'] = 'application/json';
      }
    }

    // Logging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('[PublicAxios Request]', config.method?.toUpperCase(), config.url, config);
    }

    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[PublicAxios Request Error]', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
publicAxios.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[PublicAxios Response]', response.status, response.config.url, response.data);
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[PublicAxios Response Error]', error?.response?.status, error?.response?.config?.url, error);
    }
    return Promise.reject(error);
  }
);

export default publicAxios;
