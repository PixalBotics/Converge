export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthApiRole {
  id: string;
  name: string;
}

export interface AuthApiTheme {
  backgroundColor: string | null;
  themeJson: unknown | null;
}

export interface AuthApiUser {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  role: AuthApiRole;
  theme: AuthApiTheme;
}

/** Login `/auth/login` inner `data.permission` (page + operational string arrays). */
export type LoginPermissionEnvelope = {
  page?: string[];
  operational?: string[];
  breakdown?: Record<string, unknown>;
  isPlatformAdmin?: boolean;
};

export interface LoginSuccessData extends AuthTokenPair {
  tokenType: string;
  expiresIn?: string;
  refreshExpiresIn?: string;
  user: AuthApiUser;
  /** Some APIs send `{ page: [], operational: [] }` on the token payload root. */
  permission?: LoginPermissionEnvelope;
  permissionsByType?: Record<string, string[]>;
  context?: Record<string, unknown>;
}

export interface ApiEnvelope<TData> {
  success: boolean;
  data: TData;
  message?: string;
}

export type LoginResponseEnvelope = ApiEnvelope<LoginSuccessData>;

export interface LoginRequestBody {
  email: string;
  password: string;
  licenseKey: string;
}

export interface LoginAsRequestBody {
  targetUserId: string;
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
  /** Verify/refresh could not reach the server — do not treat cookies as a logged-in session. */
  | "unreachable"
  | "error";

export interface AuthSessionSyncResult {
  status: AuthSessionSyncStatus;
  /** Set when `status` is `unreachable` or `error`. */
  error?: unknown;
}
