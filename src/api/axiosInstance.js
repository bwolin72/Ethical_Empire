import axios from 'axios';
import baseURL from './baseURL';
import { getGlobalLogout } from '../components/context/AuthContext';

const axiosInstance = axios.create({ baseURL });

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const method = config.method?.toUpperCase();
    const isFormData = config.data instanceof FormData;

    if (token) {
      config.headers['Authorization'] = `Token ${token}`; // DRF default
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

axiosInstance.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Response]', response.status, response.config.url, response.data);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const logout = getGlobalLogout();
      logout(); // Clear token from storage + auth state
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('[Response Error]', error?.response?.status, error?.response?.config?.url, error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
