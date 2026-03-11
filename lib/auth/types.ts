export interface User {
  id: string;
  email: string;
  displayName: string;
  role: "admin" | "user";
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
