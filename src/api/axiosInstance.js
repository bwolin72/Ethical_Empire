// src/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');

    // Only attach token if it's valid and not a string literal like 'undefined'
    if (token && token !== 'undefined' && token !== 'null' && token.length > 10) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      delete config.headers['Authorization']; // Ensure no bad header is sent
    }

    // Only set Content-Type for JSON data
    if (config.data && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
