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

// attach access token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      // ensure headers object exists and has correct type for axios (avoid TS2322)
      if (!config.headers) {
        // axios typings require special header shape; cast to any to avoid TS2322 here
        config.headers = {} as any;
      }

      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// response interceptor -> refresh flow
api.interceptors.response.use(
  (response) => response,
  async (err: AxiosError) => {
    // copy backend message into err.message for UI
    try {
      const data = err.response?.data as any;
      const backendMessage =
        data?.message ||
        data?.error ||
        data?.detail ||
        (data?.errors &&
          Array.isArray(data.errors) &&
          (data.errors[0]?.msg || data.errors[0]?.message));
      if (backendMessage && typeof backendMessage === "string") {
        (err as any).message = backendMessage;
      }
    } catch (_) {}

    const originalConfig = err.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalConfig || !err.response) return Promise.reject(err);

    if (err.response.status === 401 && !originalConfig._retry) {
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalConfig });
        }).then((token) => {
          if (token)
            (originalConfig.headers as any).Authorization = `Bearer ${token}`;
          return api(originalConfig);
        });
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
        return Promise.reject(lastError ?? err);
      }

      store.dispatch(setAccessToken(newToken));
      processQueue(null, newToken);
      isRefreshing = false;

      (originalConfig.headers as any).Authorization = `Bearer ${newToken}`;
      return api(originalConfig);
    }

    return Promise.reject(err);
  }
);

export default api;
