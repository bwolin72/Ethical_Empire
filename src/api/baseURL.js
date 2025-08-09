let baseURL = process.env.REACT_APP_API_BASE_URL;

if (!baseURL) {
  baseURL =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:8000/api/'
      : 'https://api.eethmghmultimedia.com';
}

if (!baseURL.endsWith('/')) baseURL += '/';

export default baseURL;
