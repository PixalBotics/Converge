export interface User {
  id: string;
  email: string;
  displayName: string;
<<<<<<< Updated upstream
  role: "admin" | "user" | "hr-admin" | "network-admin" | "manager" | "system-admin";
=======
  role: "admin" | "user" | "hr-admin" | "network-admin" | "manager";
  roleLabel?: string;
>>>>>>> Stashed changes
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
