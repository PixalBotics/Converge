export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
  licenseKey: string;
}

export interface RefreshRequestBody {
  refreshToken: string;
}

export interface LogoutRequestBody {
  refreshToken: string;
}

export interface VerifyAccessBodyRequest {
  accessToken: string;
}

/** Extend when your OpenAPI schema is wired in. */
export type AuthMeResponse = Record<string, unknown>;

export interface HealthResponse {
  app?: string;
  status?: string;
  [key: string]: unknown;
}

export type AuthSessionSyncStatus =
  | "anonymous"
  | "valid"
  | "refreshed"
  | "invalid"
  | "error";

export interface AuthSessionSyncResult {
  status: AuthSessionSyncStatus;
}
