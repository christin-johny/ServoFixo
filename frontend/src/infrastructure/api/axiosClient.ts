// src/infrastructure/api/axiosClient.ts
import axios from "axios";
import store from "../../store/store";
import { setAccessToken, logout } from "../../store/authSlice";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// primary api instance (TypeScript infers the type automatically)
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// refresh instance
const refreshApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

const REFRESH_ENDPOINTS = [
  "/api/auth/refresh",
  "/api/admin/auth/refresh",
  "/api/customer/auth/refresh",
  "/api/technician/auth/refresh",
];

interface FailedRequest {
  resolve: (value: string | PromiseLike<string | null> | null) => void;
  reject: (error?: unknown) => void;
  config: any; // Using 'any' to avoid import errors for AxiosRequestConfig
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

const normalizeAxiosError = (error: any) => {
  const data = error?.response?.data ?? error?.data ?? null;

  const backendMessage =
    data?.message ||
    data?.error ||
    data?.detail ||
    (Array.isArray(data?.errors) && (data.errors[0]?.msg || data.errors[0]?.message));

  const message = (typeof backendMessage === "string" && backendMessage) || error?.message || "Request failed";

  return {
    message,
    status: error?.response?.status ?? null,
    data,
    original: error,
  };
};

// Request Interceptor
// @ts-ignore: handling strict config type mismatch
api.interceptors.request.use(
  (config: any) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(normalizeAxiosError(error))
);

// Response Interceptor
api.interceptors.response.use(
  (response: any) => response,
  async (err: any) => {
    if (err && err.response && err.response.data) {
      try {
        const data = err.response.data;
        const backendMessage =
          data?.message ||
          data?.error ||
          data?.detail ||
          (Array.isArray(data?.errors) && (data.errors[0]?.msg || data.errors[0]?.message));

        if (backendMessage && typeof backendMessage === "string") {
          err.message = backendMessage;
        }
      } catch (_) { /* ignore */ }
    }

    const originalConfig = err.config;

    if (!originalConfig || !err.response) {
      return Promise.reject(normalizeAxiosError(err));
    }

    // 401 Refresh Flow
    if (err.response.status === 401 && !originalConfig._retry) {
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalConfig });
        })
          .then((token) => {
            if (token) originalConfig.headers.Authorization = `Bearer ${token}`;
            return api(originalConfig);
          })
          .catch((e) => Promise.reject(normalizeAxiosError(e)));
      }

      originalConfig._retry = true;
      isRefreshing = true;

      let newToken: string | null = null;
      let lastError: unknown = null;

      for (const ep of REFRESH_ENDPOINTS) {
        try {
          const resp = await refreshApi.post(ep);
          newToken = resp?.data?.accessToken ?? resp?.data?.token ?? null;
          if (newToken) break;
        } catch (e) {
          lastError = e;
        }
      }

      if (!newToken) {
        processQueue(lastError ?? err, null);
        isRefreshing = false;
        store.dispatch(logout());
        return Promise.reject(normalizeAxiosError(lastError ?? err));
      }

      store.dispatch(setAccessToken(newToken));
      processQueue(null, newToken);
      isRefreshing = false;

      originalConfig.headers.Authorization = `Bearer ${newToken}`;
      return api(originalConfig);
    }

    return Promise.reject(normalizeAxiosError(err));
  }
);

export default api;