import axios from 'axios';

// -------------------------
// Helper: Get token from storage
// -------------------------
export const getStoredAccessToken = () => {
  const remember = localStorage.getItem('remember') === 'true';
  const storage = remember ? localStorage : sessionStorage;
  const token = storage.getItem('access');
  return token && token !== 'null' && token !== 'undefined' ? token : null;
};

// -------------------------
// Main Axios Instance
// -------------------------
const axiosCommon = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// -------------------------
// Request Interceptor
// -------------------------
axiosCommon.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase();
  const isFormData = config.data instanceof FormData;

  // Add JWT token if available
  const token = getStoredAccessToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // Set content-type for non-GET requests that aren't FormData
  if (method === 'GET') {
    delete config.headers['Content-Type'];
  } else if (!isFormData) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

// -------------------------
// Helper: Apply common headers manually
// -------------------------
export const applyCommonRequestHeaders = (config, isAuth = false) => {
  config.headers = config.headers || {};
  const method = config.method?.toUpperCase();
  const isFormData = config.data instanceof FormData;

  if (isAuth) {
    const token = getStoredAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      delete config.headers['Authorization'];
    }
  }

  if (method === 'GET') {
    delete config.headers['Content-Type'];
  } else if (!isFormData) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
};

// -------------------------
// Dev-only Logger
// -------------------------
export const devLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

// -------------------------
// Cancel token factory
// -------------------------
export const createCancelToken = () => {
  const controller = new AbortController();
  return {
    signal: controller.signal,
    cancel: () => controller.abort(),
  };
};

// -------------------------
// Handle request wrapper
// -------------------------
export const handleRequest = async (promise) => {
  try {
    const res = await promise;
    return res;
  } catch (err) {
    console.error('API request failed:', err);
    throw err;
  }
};

export default axiosCommon;
