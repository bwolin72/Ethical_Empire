import axios from 'axios';

export const applyCommonRequestHeaders = (config, isAuth = false) => {
  const method = config.method?.toUpperCase();
  const isFormData = config.data instanceof FormData;

  if (isAuth) {
    const token = localStorage.getItem('token');
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers['Authorization'] = `Token ${token}`;
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

export const devLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

// Optional timeout helper
export const createCancelToken = () => {
  const controller = new AbortController();
  return {
    signal: controller.signal,
    cancel: () => controller.abort(),
  };
};
