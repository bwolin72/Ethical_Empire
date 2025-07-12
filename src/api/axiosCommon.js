import axios from 'axios';

// Get token from correct storage
const getStoredAccessToken = () => {
  const remember = localStorage.getItem('remember') === 'true';
  const storage = remember ? localStorage : sessionStorage;
  const token = storage.getItem('access');
  return token && token !== 'null' && token !== 'undefined' ? token : null;
};

export const applyCommonRequestHeaders = (config, isAuth = false) => {
  config.headers = config.headers || {};
  const method = config.method?.toUpperCase();
  const isFormData = config.data instanceof FormData;

  // ✅ Apply JWT auth
  if (isAuth) {
    const token = getStoredAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      delete config.headers['Authorization'];
    }
  }

  // Set appropriate content type
  if (method === 'GET') {
    delete config.headers['Content-Type'];
  } else if (!isFormData) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
};

// Dev log (only in development mode)
export const devLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

// Create cancel token for aborting requests
export const createCancelToken = () => {
  const controller = new AbortController();
  return {
    signal: controller.signal,
    cancel: () => controller.abort(),
  };
};

export default axios;
