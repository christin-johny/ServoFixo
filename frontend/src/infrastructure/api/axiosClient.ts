import axios from "axios";
import type { AxiosRequestConfig, AxiosError } from "axios";
import store from "../../store/store";
import { setAccessToken, logout } from "../../store/authSlice";
import { REFRESH_ENDPOINTS } from "../config/authConfig";

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

api.interceptors.response.use(
  (response: any) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!error.response || !originalConfig) {
      return Promise.reject(error);
    }

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
        let newToken: string | null = null;

        for (const endpoint of REFRESH_ENDPOINTS) {
          try {
            const resp = await refreshApi.post(endpoint);
            newToken = resp.data?.accessToken || resp.data?.token || null;

            if (newToken) break;
          } catch (_) {
            _;
          }
        }

        if (!newToken) {
          throw new Error("Refresh failed on all endpoints");
        }

        store.dispatch(setAccessToken(newToken));
        processQueue(null, newToken);

        if (originalConfig.headers) {
          originalConfig.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalConfig);
      } catch (refreshError) {
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
