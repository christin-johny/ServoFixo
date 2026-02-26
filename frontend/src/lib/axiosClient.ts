import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import store from "../store/store";
import { setAccessToken, logout } from "../store/authSlice";

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


api.interceptors.request.use(
  (config: any) => {
    const token = store.getState().auth.accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

const AUTH_ENDPOINTS = [
  '/customer/auth/login',
  '/customer/auth/register/init-otp',
  '/customer/auth/register/verify-otp',
  '/customer/auth/forgot-password/init-otp',
  '/customer/auth/forgot-password/verify-otp',
  '/admin/auth/login',
  '/technician/auth/login',
  '/technician/auth/register',
  '/auth/refresh' 
];

const isAuthEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return AUTH_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

api.interceptors.response.use(
  (response: any) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!error.response || !originalConfig) {
      return Promise.reject(error);
    }

    if (isAuthEndpoint(originalConfig.url)) {
      return Promise.reject(error);
    }
 
    if (error.response.status === 401 && !originalConfig._retry) {
      originalConfig._retry = true;

      try {
        const resp = await refreshApi.post('/auth/refresh');
        const newToken = resp.data?.accessToken || resp.data?.token || null;

        if (!newToken) {
          throw new Error("Refresh failed: No token returned");
        }

        // Update Store
        store.dispatch(setAccessToken(newToken));

        // Update the original request header and retry immediately
        if (originalConfig.headers) {
          originalConfig.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalConfig);

      } catch (refreshError) {
        // If refresh fails, log out the user
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;