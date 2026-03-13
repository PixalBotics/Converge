import type { User, LoginCredentials } from "./types";

const MOCK_USERS: User[] = [
  {
    id: "usr-demo-001",
    email: "demo@gmail.com",
    displayName: "Demo User",
    role: "user",
  },
  {
    id: "usr-admin-001",
    email: "admin@gmail.com",
    displayName: "Admin",
    role: "admin",
  },
];

const MOCK_CREDENTIALS: Record<string, { password: string; licenseKey?: string }> = {
  "demo@gmail.com": { password: "Demo123" },
  "admin@gmail.com": { password: "Admin123", licenseKey: "1234" },
};

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateCredentials(credentials: LoginCredentials): User | null {
  const email = normalizeEmail(credentials.email);
  const stored = MOCK_CREDENTIALS[email];
  if (!stored || stored.password !== credentials.password) return null;
  if (stored.licenseKey && credentials.licenseKey?.trim() !== stored.licenseKey) return null;
  return MOCK_USERS.find((u) => normalizeEmail(u.email) === email) ?? null;
}

export function createSession(user: User): { user: User; expiresAt: number } {
  return {
    user,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };
}

export function isSessionValid(expiresAt: number): boolean {
  return Date.now() < expiresAt;
}

export const MOCK_LOGIN_HINT = {
  email: "demo@gmail.com",
  password: "Demo123",
  licenseKey: "Optional for demo user",
};
