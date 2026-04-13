import { apiClient } from "../http/axios-instance";
import {
  clearTokens,
  getRefreshToken,
  setTokenPair,
} from "../storage/auth-cookies";
import type {
  AuthMeResponse,
  AuthTokenPair,
  HealthResponse,
  LoginRequestBody,
  LogoutRequestBody,
  RefreshRequestBody,
  VerifyAccessBodyRequest,
} from "../types/auth.types";

export async function getHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>("/health");
  return data;
}

export async function login(body: LoginRequestBody): Promise<AuthTokenPair> {
  const { data } = await apiClient.post<AuthTokenPair>("/auth/login", body);
  setTokenPair(data);
  return data;
}

export async function verifyBearer(): Promise<void> {
  await apiClient.get("/auth/verify");
}

export async function verifyAccessBody(
  body: VerifyAccessBodyRequest,
): Promise<void> {
  await apiClient.post("/auth/verify-access", body);
}

export async function getMe(options?: {
  permissionsBreakdown?: boolean;
}): Promise<AuthMeResponse> {
  const { data } = await apiClient.get<AuthMeResponse>("/auth/me", {
    params:
      options?.permissionsBreakdown === true
        ? { permissionsBreakdown: "1" }
        : undefined,
  });
  return data;
}

export async function refresh(
  body: RefreshRequestBody,
): Promise<AuthTokenPair> {
  const { data } = await apiClient.post<AuthTokenPair>("/auth/refresh", body);
  setTokenPair(data);
  return data;
}

export async function logoutRemote(body: LogoutRequestBody): Promise<void> {
  await apiClient.post("/auth/logout", body);
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await logoutRemote({ refreshToken });
    }
  } finally {
    clearTokens();
  }
}
