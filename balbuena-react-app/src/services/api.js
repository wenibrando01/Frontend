import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  // Preferred simple storage (matches your snippet)
  const directToken = localStorage.getItem("token");
  if (directToken) {
    config.headers.Authorization = `Bearer ${directToken}`;
    return config;
  }

  // Back-compat for existing app storage shape
  const auth = localStorage.getItem("enrollsys_auth_v1");
  if (auth) {
    try {
      const token = JSON.parse(auth)?.token;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // ignore malformed storage
    }
  }

  return config;
});

export default api;