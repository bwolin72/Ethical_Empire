import axios from 'axios';

// === Helper: Get token from correct storage ===
const getStoredAccessToken = () => {
  const remember = localStorage.getItem('remember') === 'true';
  const storage = remember ? localStorage : sessionStorage;
  const token = storage.getItem('access');
  return token && token !== 'null' && token !== 'undefined' ? token : null;
};

// === Main Axios Instance ===
const axiosCommon = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://localhost:8000/api', // fallback for local dev
  headers: {
    'Content-Type': 'application/json',
  },
});

// === Request Interceptor for Auth Header and Content-Type ===
axiosCommon.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase();
  const isFormData = config.data instanceof FormData;

  // 🔒 Add JWT token
  const token = getStoredAccessToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // Set content-type only for non-GET and non-FormData
  if (method === 'GET') {
    delete config.headers['Content-Type'];
  } else if (!isFormData) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

// === Exportable function to apply headers manually (for other axios instances) ===
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

// === Dev-only Logger ===
export const devLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

// === Cancel token factory ===
export const createCancelToken = () => {
  const controller = new AbortController();
  return {
    signal: controller.signal,
    cancel: () => controller.abort(),
  };
};

export default axiosCommon;
