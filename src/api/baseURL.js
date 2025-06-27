// baseURL.js
let baseURL = process.env.REACT_APP_API_BASE_URL;

if (!baseURL) {
  baseURL =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:8000/api/'
      : 'https://ethical-backend-production.up.railway.app/api/';
}

if (!baseURL.endsWith('/')) baseURL += '/';

export default baseURL;
