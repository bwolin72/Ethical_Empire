import axiosInstance from "../api/axiosInstance";

const API_BASE_URL = import.meta?.env?.REACT_API_BASE_URL || "https://api.eethmghmultimedia.com";

export const getAuthToken = () => {
  try {
    return localStorage.getItem("auth_token");
  } catch (e) {
    return null;
  }
};

const workerApi = axiosInstance.create({
  baseURL: `${API_BASE_URL}/api/workers/`,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// Attach token
workerApi.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers["Authorization"] = `Token ${token}`;
  return config;
});

// Centralized error normalization
workerApi.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message ||
      "Request failed";
    return Promise.reject({ ...err, message });
  }
);

export default workerApi;
