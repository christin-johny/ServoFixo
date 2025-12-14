// src/infrastructure/api/axiosClient.ts
import axios from "axios";
import type { AxiosRequestConfig, AxiosError } from "axios";
import store from "../../store/store";
import { setAccessToken, logout } from "../../store/authSlice";
import { REFRESH_ENDPOINTS } from "../config/authConfig";

const API_BASE = import.meta.env.VITE_API_BASE ;

// --- 1. Primary Instance (With Interceptors) ---
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// --- 2. Refresh Instance (No Interceptors) ---
// We export this so authRepository can use it directly
export const refreshApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// --- 3. Queue Mechanism for Concurrency ---
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

// --- 4. Request Interceptor ---
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- 5. Response Interceptor ---
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If no response (network error) or no config, reject immediately
    if (!error.response || !originalConfig) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized (and ensure we haven't already retried)
    if (error.response.status === 401 && !originalConfig._retry) {
      
      // A. If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalConfig });
        })
          .then((token) => {
            if (token && originalConfig.headers) {
              originalConfig.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalConfig);
          })
          .catch((err) => Promise.reject(err));
      }

      // B. Start Refresh Flow
      originalConfig._retry = true;
      isRefreshing = true;

      try {
        let newToken: string | null = null;

        // Loop through all possible refresh endpoints
        for (const endpoint of REFRESH_ENDPOINTS) {
          try {
            // Use refreshApi (clean instance) to avoid circular interceptors
            const resp = await refreshApi.post(endpoint);
            // Support different response structures
            newToken = resp.data?.accessToken || resp.data?.token || null;
            
            if (newToken) break; // Found a working endpoint
          } catch (e) {
            // Continue to next endpoint
          }
        }

        if (!newToken) {
          throw new Error("Refresh failed on all endpoints");
        }

        // Success: Update Store & Process Queue
        store.dispatch(setAccessToken(newToken));
        processQueue(null, newToken);
        
        // Retry Original Request
        if (originalConfig.headers) {
          originalConfig.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalConfig);

      } catch (refreshError) {
        // Fatal: Refresh failed (Token expired or reused)
        processQueue(refreshError, null);
        store.dispatch(logout()); // Hard Logout
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;