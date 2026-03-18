"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User, LoginCredentials, AuthSession } from "./types";
import {
  validateCredentialsDetailed,
  createSession,
  isSessionValid,
} from "./mockAuth";

const SESSION_KEY = "interchanges_session";

function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    return isSessionValid(session.expiresAt) ? session : null;
  } catch {
    return null;
  }
}

function setStoredSession(session: AuthSession | null): void {
  if (typeof window === "undefined") return;
  if (session) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

type LoginFieldErrors = {
  email?: string;
  password?: string;
  licenseKey?: string;
};

interface LoginResult {
  success: boolean;
  error?: string;
  fieldErrors?: LoginFieldErrors;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => LoginResult;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = getStoredSession();
    setUser(session?.user ?? null);
    setIsLoading(false);
  }, []);

  const login = useCallback(
    (credentials: LoginCredentials): LoginResult => {
      const { user: matchedUser, fieldErrors } =
        validateCredentialsDetailed(credentials);

      if (!matchedUser) {
        return {
          success: false,
          error: "Invalid email, license key, or password.",
          fieldErrors,
        };
      }

      const session = createSession(matchedUser);
      setStoredSession(session);
      setUser(matchedUser);
      router.push("/dashboard");

      return { success: true };
    },
    [router],
  );

  const logout = useCallback(() => {
    setStoredSession(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
