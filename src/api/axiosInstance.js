// src/api/axiosInstance.js
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import baseURL from './baseURL';

const axiosInstance = axios.create({ baseURL });

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const isTokenValid = (token) => {
  try {
    const { exp } = jwtDecode(token);
    return exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

// === Request Interceptor ===
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    const method = config.method?.toUpperCase();
    const isFormData = config.data instanceof FormData;

    if (token && isTokenValid(token)) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      delete config.headers['Authorization'];
    }

    if (method === 'GET') {
      delete config.headers['Content-Type'];
    } else if (!isFormData) {
      config.headers['Content-Type'] = 'application/json';
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[Request]', method, config.url, config);
    }

    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Request Error]', error);
    }
    return Promise.reject(error);
  }
);

// === Response Interceptor ===
axiosInstance.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Response]', response.status, response.config.url, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh');

      if (!refresh || !isTokenValid(refresh)) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const { data } = await axios.post(`${baseURL}user-account/refresh/`, { refresh });
        const { access } = data;

        localStorage.setItem('access', access);
        axiosInstance.defaults.headers['Authorization'] = `Bearer ${access}`;
        onRefreshed(access);

        return axiosInstance(originalRequest);
      } catch (err) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('[Response Error]', error?.response?.status, error?.response?.config?.url, error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
