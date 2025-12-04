// src/infrastructure/api/axiosClient.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import store from "../../store/store";
import { setAccessToken, logout } from "../../store/authSlice";
import type { AxiosRequestConfig } from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// --- 1. The main API instance with interceptors ---
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // important for httpOnly refresh cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// --- 2. Dedicated instance for the refresh token call (No interceptors) ---
const refreshApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// --- Types for the refresh queue ---
interface FailedRequest {
  resolve: (value: string | PromiseLike<string | null> | null) => void;
  reject: (error?: unknown) => void;
  config: AxiosRequestConfig;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

// --- Request interceptor: attach access token ---
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      // make sure headers object exists
      if (!config.headers) config.headers = {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response interceptor: handle 401 -> refresh flow with queue ---
// Also copy meaningful backend message into err.message
api.interceptors.response.use(
  (response) => response,
  async (err: AxiosError) => {
    // SAFELY extract backend message and copy to err.message so UI can read it
    try {
      const data = err.response?.data as any;
      const backendMessage =
        data?.message ||
        data?.error ||
        data?.detail ||
        (data?.errors && Array.isArray(data.errors) && (data.errors[0]?.msg || data.errors[0]?.message));
      if (backendMessage && typeof backendMessage === "string") {
        (err as any).message = backendMessage;
      }
    } catch (_) {
      // ignore
    }

    const originalConfig = err.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalConfig || !err.response) {
      return Promise.reject(err);
    }

    if (err.response.status === 401 && !originalConfig._retry) {
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalConfig });
        }).then((token) => {
          if (token) {
            (originalConfig.headers as any).Authorization = `Bearer ${token}`;
          }
          return api(originalConfig);
        });
      }

      originalConfig._retry = true;
      isRefreshing = true;

      try {
        // use refreshApi (no interceptors) to avoid loops
        const resp = await refreshApi.post("/api/customer/auth/refresh");
        const newToken = resp?.data?.token ?? resp?.data?.accessToken ?? null;

        if (newToken) {
          store.dispatch(setAccessToken(newToken));
        }

        processQueue(null, newToken);
        isRefreshing = false;

        if (newToken) {
          (originalConfig.headers as any).Authorization = `Bearer ${newToken}`;
        }

        return api(originalConfig);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;
        store.dispatch(logout());
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
