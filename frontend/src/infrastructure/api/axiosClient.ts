// src/infrastructure/api/axiosClient.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import store from "../../store/store";
import { setAccessToken, logout } from "../../store/authSlice";
import type { AxiosRequestConfig } from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// primary api instance
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// refresh instance without attached interceptors to avoid loops
const refreshApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Preferred refresh endpoints (shared first)
const REFRESH_ENDPOINTS = [
  "/api/auth/refresh",
  "/api/admin/auth/refresh",
  "/api/customer/auth/refresh",
  "/api/technician/auth/refresh",
];

interface FailedRequest {
  resolve: (value: string | PromiseLike<string | null> | null) => void;
  reject: (error?: unknown) => void;
  config: AxiosRequestConfig;
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

/**
 * Build a normalized error object for consistent handling across the app.
 * If interceptor already overwrote err.message with backend message, it will be used.
 */
const normalizeAxiosError = (error: AxiosError | any) => {
  const data = error?.response?.data ?? error?.data ?? null;

  // backend message extraction
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

// attach access token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      // ensure headers object exists and has correct type for axios (avoid TS2322)
      if (!config.headers) {
        config.headers = {} as any;
      }

      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(normalizeAxiosError(error))
);

// response interceptor -> refresh flow + message override
api.interceptors.response.use(
  (response) => response,
  async (err: AxiosError | any) => {
    // 1) If backend returned a JSON message/error, override axios default err.message
    if (err && err.response && err.response.data) {
      try {
        const data = err.response.data as any;
        const backendMessage =
          data?.message ||
          data?.error ||
          data?.detail ||
          (Array.isArray(data?.errors) && (data.errors[0]?.msg || data.errors[0]?.message));

        if (backendMessage && typeof backendMessage === "string") {
          // override runtime message so components using err.message get backend text
          (err as any).message = backendMessage;
        }
      } catch (_) {
        // ignore extraction errors — we'll still normalize below
      }
    }

    const originalConfig = err.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If there is no config or no response (network / unknown), return normalized error
    if (!originalConfig || !err.response) {
      return Promise.reject(normalizeAxiosError(err));
    }

    // --- 401 refresh token flow (unchanged logic) ---
    if (err.response.status === 401 && !originalConfig._retry) {
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalConfig });
        })
          .then((token) => {
            if (token) (originalConfig.headers as any).Authorization = `Bearer ${token}`;
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
        // fail queued requests and logout
        processQueue(lastError ?? err, null);
        isRefreshing = false;
        store.dispatch(logout());
        return Promise.reject(normalizeAxiosError(lastError ?? err));
      }

      // update store and retry queued requests
      store.dispatch(setAccessToken(newToken));
      processQueue(null, newToken);
      isRefreshing = false;

      (originalConfig.headers as any).Authorization = `Bearer ${newToken}`;
      return api(originalConfig);
    }

    // default: reject with normalized error
    return Promise.reject(normalizeAxiosError(err));
  }
);

export default api;
