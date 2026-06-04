import { apiClient } from "../http/axios-instance";
import {
  clearTokens,
  getRefreshToken,
  getTokenPair,
  setTokenPair,
} from "../storage/auth-cookies";
import type {
  ApiEnvelope,
  AuthMeResponse,
  AuthTokenPair,
  HealthResponse,
  LoginAsRequestBody,
  LoginRequestBody,
  LoginResponseEnvelope,
  LoginSuccessData,
  LogoutRequestBody,
  PasswordResetConfirmBody,
  PasswordResetMessageResponse,
  PasswordResetRequestBody,
  PasswordResetVerifyBody,
  PasswordResetVerifyResponse,
  RefreshRequestBody,
  VerifyAccessBodyRequest,
} from "../types/auth.types";
import {
  clearImpersonationSession,
  isImpersonatingSessionActive,
  setImpersonationSession,
} from "@/lib/auth/impersonation-session";

export async function getHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>("/health");
  return data;
}

export async function login(body: LoginRequestBody): Promise<LoginSuccessData> {
  const { data } = await apiClient.post<LoginResponseEnvelope>("/auth/login", body);
  setTokenPair(
    {
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    },
    {
      accessExpiresIn: data.data.expiresIn,
      refreshExpiresIn: data.data.refreshExpiresIn,
    },
  );
  return data.data;
}

export async function loginAs(body: LoginAsRequestBody): Promise<LoginSuccessData> {
  const originalTokenPair = getTokenPair();
  const { data } = await apiClient.post<LoginResponseEnvelope>("/auth/login-as", body);
  if (originalTokenPair && !isImpersonatingSessionActive()) {
    setImpersonationSession({
      originalTokenPair,
      impersonatedUserId: body.targetUserId,
      impersonatedLicenseKey: body.licenseKey,
      startedAt: new Date().toISOString(),
    });
  }
  setTokenPair(
    {
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    },
    {
      accessExpiresIn: data.data.expiresIn,
      refreshExpiresIn: data.data.refreshExpiresIn,
    },
  );
  return data.data;
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
  const { data } = await apiClient.post<
    AuthTokenPair | ApiEnvelope<AuthTokenPair | LoginSuccessData>
  >("/auth/refresh", body);
  const root =
    typeof data === "object" && data !== null && "data" in data
      ? (data as ApiEnvelope<AuthTokenPair | LoginSuccessData>).data
      : (data as AuthTokenPair | LoginSuccessData);
  const tokenPair: AuthTokenPair = {
    accessToken: String(root.accessToken ?? "").trim(),
    refreshToken: String(root.refreshToken ?? "").trim(),
  };
  const loginMeta = root && typeof root === "object" ? (root as LoginSuccessData) : null;
  setTokenPair(tokenPair, {
    accessExpiresIn: loginMeta?.expiresIn,
    refreshExpiresIn: loginMeta?.refreshExpiresIn,
  });
  return tokenPair;
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
    clearImpersonationSession();
    clearTokens();
  }
}

export async function requestPasswordReset(
  body: PasswordResetRequestBody,
): Promise<string> {
  const { data } = await apiClient.post<PasswordResetMessageResponse>(
    "/auth/password-reset/request",
    body,
  );
  return data.data.message;
}

export async function verifyPasswordResetOtp(
  body: PasswordResetVerifyBody,
): Promise<void> {
  await apiClient.post<PasswordResetVerifyResponse>(
    "/auth/password-reset/verify",
    body,
  );
}

export async function confirmPasswordReset(
  body: PasswordResetConfirmBody,
): Promise<string> {
  const { data } = await apiClient.post<PasswordResetMessageResponse>(
    "/auth/password-reset/confirm",
    body,
  );
  return data.data.message;
}
