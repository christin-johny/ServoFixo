import axios from "axios";
import type { AxiosRequestConfig, AxiosError } from "axios";
import store from "../../store/store";
import { setAccessToken, logout } from "../../store/authSlice";


const API_BASE = import.meta.env.VITE_API_BASE;

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const refreshApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

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

// Request Interceptor (Unchanged - works perfectly)
api.interceptors.request.use(
  (config: any) => {
    const token = store.getState().auth.accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// List of endpoints that should NEVER trigger a refresh loop
const AUTH_ENDPOINTS = [
  '/customer/auth/login',
  '/customer/auth/register/init-otp',
  '/customer/auth/register/verify-otp',
  '/customer/auth/forgot-password/init-otp',
  '/customer/auth/forgot-password/verify-otp',
  '/admin/auth/login',
  '/technician/auth/login',
  '/technician/auth/register',
  '/auth/refresh' // 🟢 Added this so we don't refresh the refresh!
];

const isAuthEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return AUTH_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

api.interceptors.response.use(
  (response: any) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!error.response || !originalConfig) {
      return Promise.reject(error);
    }

    // 1. Don't retry if it's a login or auth call failing
    if (isAuthEndpoint(originalConfig.url)) {
      return Promise.reject(error);
    }

    // 2. Handle 401 Unauthorized
    if (error.response.status === 401 && !originalConfig._retry) {
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

      originalConfig._retry = true;
      isRefreshing = true;

      try {
        // 🟢 REFACTORED: Single Centralized Refresh Call
        const resp = await refreshApi.post('/auth/refresh');
        const newToken = resp.data?.accessToken || resp.data?.token || null;

        if (!newToken) {
          throw new Error("Refresh failed: No token returned");
        }

        // Success! Update everything.
        store.dispatch(setAccessToken(newToken));
        processQueue(null, newToken);

        if (originalConfig.headers) {
          originalConfig.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalConfig);

      } catch (refreshError) {
        // If refresh fails, log them out completely
        processQueue(refreshError, null);
        store.dispatch(logout());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;