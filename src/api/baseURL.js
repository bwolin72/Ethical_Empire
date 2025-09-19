let baseURL = process.env.REACT_APP_API_BASE_URL;

if (!baseURL) {
  baseURL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8000/api"
      : "https://api.eethmghmultimedia.com/api";
}

// Remove trailing slash if exists
if (baseURL.endsWith("/")) {
  baseURL = baseURL.slice(0, -1);
}

export default baseURL;
