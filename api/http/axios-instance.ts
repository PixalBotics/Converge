import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { getApiBaseUrl } from "../config";
import { clearTokens, getAccessToken } from "../storage/auth-cookies";
import { refreshSessionWithStoredRefresh } from "../session/refresh-access-token";
import { pathFromConfig } from "./http-path";
import { isPublicAuthRoute } from "./public-routes";

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (isPublicAuthRoute(config)) {
    return config;
  }
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined;
    const status = error.response?.status;

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isPublicAuthRoute(originalRequest)
    ) {
      return Promise.reject(error);
    }

    const path = pathFromConfig(originalRequest);
    if (path.endsWith("/auth/refresh")) {
      clearTokens();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const tokens = await refreshSessionWithStoredRefresh();
      originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return apiClient(originalRequest);
    } catch {
      clearTokens();
      return Promise.reject(error);
    }
  },
);
