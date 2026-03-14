import axios from "axios";

const rawBase = import.meta.env.VITE_API_BASE_URL?.toString().trim();
const API_BASE_URL =
  rawBase ||
  (import.meta.env.DEV && "http://localhost:8000/api") ||
  "/api";

function readOptionalPath(envValue, fallback) {
  if (envValue === undefined || envValue === null) return fallback;
  const raw = envValue.toString().trim();
  if (!raw) return null; // explicit disable via empty string
  if (["off", "false", "0", "disabled", "none", "null"].includes(raw.toLowerCase()))
    return null;
  return raw.startsWith("/") ? raw : `/${raw}`;
}

const AUTH_LOGIN_PATH = readOptionalPath(import.meta.env.VITE_AUTH_LOGIN_PATH, "/login");
const AUTH_REGISTER_PATH = readOptionalPath(
  import.meta.env.VITE_AUTH_REGISTER_PATH,
  "/register"
);
const AUTH_LOGOUT_PATH = readOptionalPath(import.meta.env.VITE_AUTH_LOGOUT_PATH, "/logout");

function joinUrl(base, path) {
  if (!base) return path;
  if (!path) return base;
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Use token from localStorage (remember me) or sessionStorage (session only)
const getStoredToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("session_token");

// Add Authorization header automatically if token exists
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers.Accept = config.headers.Accept || "application/json";
  return config;
});

const DEFAULT_RETRY = {
  retries: 2,
  baseDelayMs: 350,
  maxDelayMs: 2000,
};

function shouldRetry(error, config) {
  const method = (config?.method || "get").toLowerCase();
  const status = error?.response?.status;
  const isIdempotent = ["get", "head", "options"].includes(method);
  if (!isIdempotent) return false;
  if (!status) return true; // network error / timeout
  if (status === 429) return true;
  return status >= 500 && status <= 599;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const config = error?.config;
    if (!config) throw error;

    // If token is invalid/expired, clear both storages so the app can re-auth.
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("session_token");
    }

    const retryCfg = { ...DEFAULT_RETRY, ...(config.retry || {}) };
    config.__retryCount = config.__retryCount || 0;

    if (config.__retryCount >= retryCfg.retries) throw error;
    if (!shouldRetry(error, config)) throw error;

    config.__retryCount += 1;
    const backoff = Math.min(
      retryCfg.maxDelayMs,
      retryCfg.baseDelayMs * Math.pow(2, config.__retryCount - 1)
    );
    const jitter = Math.floor(Math.random() * 120);
    await sleep(backoff + jitter);
    return api.request(config);
  }
);

export const auth = {
  adminLogin: (payload) => api.post("/admin/login", payload),
  studentLogin: (payload) => api.post("/student/login", payload),
  studentRegister: (payload) => {
    if (!AUTH_REGISTER_PATH) {
      const err = new Error("Registration is disabled (no register endpoint configured).");
      err.code = "REGISTER_DISABLED";
      throw err;
    }
    return api.post(AUTH_REGISTER_PATH, payload);
  },
  logout: () => {
    if (!AUTH_LOGOUT_PATH) return Promise.resolve();
    return api.post(AUTH_LOGOUT_PATH);
  },
};

export const endpoints = {
  auth: {
    login: joinUrl(API_BASE_URL, AUTH_LOGIN_PATH),
    register: AUTH_REGISTER_PATH ? joinUrl(API_BASE_URL, AUTH_REGISTER_PATH) : null,
    logout: AUTH_LOGOUT_PATH ? joinUrl(API_BASE_URL, AUTH_LOGOUT_PATH) : null,
  },
};

export default api;