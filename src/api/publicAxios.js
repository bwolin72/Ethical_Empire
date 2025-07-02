import axios from 'axios';
import baseURL from './baseURL';
import { applyCommonRequestHeaders, devLog } from './axiosCommon';

const publicAxios = axios.create({
  baseURL,
  timeout: 8000, // 8 seconds
});

publicAxios.interceptors.request.use(
  (config) => {
    config = applyCommonRequestHeaders(config, false);
    devLog('[Public Request]', config.method?.toUpperCase(), config.url, config);
    return config;
  },
  (error) => {
    devLog('[Public Request Error]', error);
    return Promise.reject(error);
  }
);

publicAxios.interceptors.response.use(
  (response) => {
    devLog('[Public Response]', response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    devLog('[Public Response Error]', error?.response?.status, error?.response?.config?.url, error);
    return Promise.reject(error);
  }
);

export default publicAxios;
