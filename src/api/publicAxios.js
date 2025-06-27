// src/api/publicAxios.js
import axios from 'axios';
import baseURL from './baseURL';

const publicAxios = axios.create({ baseURL });

publicAxios.interceptors.request.use(
  (config) => {
    const method = config.method?.toUpperCase();
    const isFormData = config.data instanceof FormData;

    if (method === 'GET') {
      delete config.headers['Content-Type'];
    } else if (!isFormData) {
      config.headers['Content-Type'] = 'application/json';
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[Public Request]', method, config.url, config);
    }

    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Public Request Error]', error);
    }
    return Promise.reject(error);
  }
);

publicAxios.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Public Response]', response.status, response.config.url, response.data);
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Public Response Error]', error?.response?.status, error?.response?.config?.url, error);
    }
    return Promise.reject(error);
  }
);

export default publicAxios;
