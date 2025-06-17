// src/api/publicAxios.js
import axios from 'axios';

const publicAxios = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default publicAxios;
