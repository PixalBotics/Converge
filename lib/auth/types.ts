export type AuthUserType = "Internal" | "External";

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: "admin" | "user" | "hr-admin" | "network-admin" | "manager";
  roleLabel?: string;
  /** From `/auth/me` (`userType` / `user_type`). */
  userType?: AuthUserType;
  /** From `/auth/me` when the backend attaches HRMS pool scope to the user. */
  poolId?: string;
  poolName?: string;
  /** Tenant reseller scope (`/auth/me` user or JWT). */
  resellerId?: string;
  /** External portfolio admin (`/auth/me` or JWT). */
  wideResellerScope?: boolean;
  /** Client root (parent company) from JWT or `/auth/me`. */
  parentCompanyId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  licenseKey?: string;
  rememberMe?: boolean;
}

export interface AuthSession {
  user: User;
  expiresAt: number;
}
