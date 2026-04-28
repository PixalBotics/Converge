export interface User {
  id: string;
  email: string;
  displayName: string;
  role: "admin" | "user" | "hr-admin" | "network-admin" | "manager";
  roleLabel?: string;
  /** From `/auth/me` when the backend attaches HRMS pool scope to the user. */
  poolId?: string;
  poolName?: string;
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
