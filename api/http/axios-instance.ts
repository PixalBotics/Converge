import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { getApiBaseUrl } from "../config";
import { getAccessToken } from "../storage/auth-cookies";
import {
  queueRequestUntilRefreshed,
  refreshSessionWithStoredRefresh,
  waitForSessionRefresh,
} from "../session/refresh-access-token";
import { terminateAuthSession } from "../session/terminate-auth-session";
import {
  isAccessTokenExpiringSoon,
  isDashboardAccessToken,
} from "@/lib/auth/access-token";
import { applyRotatedAuthHeaders } from "@/lib/auth/apply-rotated-auth-headers";
import { isAuthTransitionActive } from "@/lib/auth/auth-transition";
import { isImpersonatingSessionActive } from "@/lib/auth/impersonation-session";
import { isTransientNetworkError } from "@/lib/app-boundaries/classify-api-error";
import { pathFromConfig } from "./http-path";
import { isPublicAuthRoute, isWidgetVisitorRoute } from "./public-routes";

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

function isEmbedAppContext(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/embed/");
}

apiClient.interceptors.request.use(async (config) => {
  if (isPublicAuthRoute(config)) {
    if (isWidgetVisitorRoute(config)) {
      delete config.headers.Authorization;
    }
    return config;
  }

  await waitForSessionRefresh();

  let token = getAccessToken();

  if (token && isAccessTokenExpiringSoon(token)) {
    try {
      const rotated = await refreshSessionWithStoredRefresh();
      token = rotated.accessToken;
    } catch {
      /* 401 handler will refresh or sign out */
    }
  }

  if (token && !isDashboardAccessToken(token)) {
    token = null;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function isAuthTokenSwapResponse(config: InternalAxiosRequestConfig | undefined): boolean {
  if (!config) return false;
  const path = pathFromConfig(config);
  return path.endsWith("/auth/login") || path.endsWith("/auth/login-as");
}

apiClient.interceptors.response.use(
  (response) => {
    if (!isAuthTokenSwapResponse(response.config as InternalAxiosRequestConfig)) {
      applyRotatedAuthHeaders(response.headers as Record<string, unknown>);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined;
    const status = error.response?.status;
    const headersRotated =
      originalRequest && isAuthTokenSwapResponse(originalRequest)
        ? false
        : applyRotatedAuthHeaders(error.response?.headers as Record<string, unknown>);

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      headersRotated
    ) {
      const token = getAccessToken();
      if (token && isDashboardAccessToken(token)) {
        originalRequest._retry = true;
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      }
    }

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isPublicAuthRoute(originalRequest)
    ) {
      return Promise.reject(error);
    }

    if (isWidgetVisitorRoute(originalRequest) || isEmbedAppContext()) {
      return Promise.reject(error);
    }

    const path = pathFromConfig(originalRequest);
    if (path.endsWith("/auth/refresh")) {
      if (!isAuthTransitionActive() && !isImpersonatingSessionActive()) {
        await terminateAuthSession("refresh_failed");
      }
      return Promise.reject(error);
    }

    const bodyMsg =
      typeof error.response?.data === "object" &&
      error.response.data !== null &&
      "message" in error.response.data &&
      typeof (error.response.data as { message?: unknown }).message === "string"
        ? (error.response.data as { message: string }).message
        : "";
    const bodyMsgLower = bodyMsg.toLowerCase();
    if (
      bodyMsgLower.includes("widget session") ||
      bodyMsgLower.includes("widget-session") ||
      bodyMsgLower.includes("invalid token type")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const accessToken = await queueRequestUntilRefreshed();
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshErr) {
      if (isTransientNetworkError(refreshErr) || isTransientNetworkError(error)) {
        return Promise.reject(error);
      }
      if (!isAuthTransitionActive() && !isImpersonatingSessionActive()) {
        await terminateAuthSession("refresh_failed");
      }
      return Promise.reject(error);
    }
  },
);
