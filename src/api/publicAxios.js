// src/api/publicAxios.js
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://ethical-backend.onrender.com/api/';

const publicAxios = axios.create({
  baseURL: baseURL.endsWith('/') ? baseURL : `${baseURL}/`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default publicAxios;
