import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import store from "../../store/store";
import { setAccessToken, logout } from "../../store/authSlice";

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
  resolve: (value?: string | PromiseLike<string | null> | null) => void;
  reject: (error?: unknown) => void;
  config: InternalAxiosRequestConfig; // Changed from AxiosRequestConfig
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
  (config: InternalAxiosRequestConfig) => { // Explicitly typed
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response interceptor: handle 401 -> refresh flow with queue ---
api.interceptors.response.use(
  (response) => response,
  async (err: AxiosError) => {
    const originalConfig = err.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Safety check for critical properties
    if (!originalConfig || !err.response) {
        return Promise.reject(err);
    }
    
    // Check for 401 and ensure it's not an already retried request
    if (err.response.status === 401 && !originalConfig._retry) {
      if (isRefreshing) {
        // Queue the request until refresh finishes
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalConfig });
        }).then((token) => {
          if (token) {
            originalConfig.headers.Authorization = `Bearer ${token}`;
          }
          // Use 'api' instance to retry, which respects all interceptors
          return api(originalConfig); 
        });
      }

      originalConfig._retry = true;
      isRefreshing = true;

      try {
        // *** FIX: Use the dedicated refreshApi instance to prevent interceptor loop ***
        const resp = await refreshApi.post("/api/customer/auth/refresh");
        const newToken = resp?.data?.token ?? null;
        
        if (newToken) {
          store.dispatch(setAccessToken(newToken));
        }

        processQueue(null, newToken);
        isRefreshing = false;

        // Apply the new token to the original failed request configuration
        if (newToken) {
          originalConfig.headers.Authorization = `Bearer ${newToken}`;
        }
        
        // Retry the original request
        return api(originalConfig);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;
        store.dispatch(logout());
        // Reject all queued requests and the original request
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default api;