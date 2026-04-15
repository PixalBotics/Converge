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
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import type { User, LoginCredentials } from "./types";
import { getAccessToken, getMe, synchronizeAuthSession } from "@/api";
import { useLoginMutation, useLogoutMutation } from "@/lib/hooks";

type AccessTokenPayload = {
  userId?: string;
  email?: string;
  roles?: string[];
};

type ApiRole = {
  name?: string;
};

type ApiUser = {
  id?: string;
  email?: string;
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  role?: ApiRole;
};

function decodeJwtPayload(token: string): AccessTokenPayload | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const decoded = atob(padded);
    return JSON.parse(decoded) as AccessTokenPayload;
  } catch {
    return null;
  }
}

function mapRoleNameToAppRole(roleName?: string): User["role"] {
  const normalized = roleName?.trim().toLowerCase() ?? "";
  if (normalized.includes("hr")) return "hr-admin";
  if (normalized.includes("network")) return "network-admin";
  if (normalized.includes("manager")) return "manager";
  if (normalized.includes("employee") || normalized.includes("agent")) return "user";
  return "admin";
}

function toDisplayName(user: ApiUser): string {
  const first = user.firstName?.trim() ?? "";
  const middle = user.middleName?.trim() ?? "";
  const last = user.lastName?.trim() ?? "";
  const fullName = [first, middle, last].filter(Boolean).join(" ").trim();
  return fullName || (user.email?.trim() ?? "");
}

function mapApiUserToUser(user: ApiUser): User | null {
  if (!user.id || !user.email) {
    return null;
  }
  const roleName = user.role?.name;
  return {
    id: user.id,
    email: user.email,
    displayName: toDisplayName(user) || user.email,
    role: mapRoleNameToAppRole(roleName),
    roleLabel: roleName?.trim() || undefined,
  };
}

function extractUserFromMePayload(payload: unknown): ApiUser | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const source = payload as {
    user?: ApiUser;
    data?: { user?: ApiUser };
  };
  return source.user ?? source.data?.user ?? null;
}

function getUserFromAccessToken(): User | null {
  const accessToken = getAccessToken();
  if (!accessToken) return null;
  const payload = decodeJwtPayload(accessToken);
  if (!payload?.userId || !payload?.email) return null;
  const firstRole = Array.isArray(payload.roles) ? payload.roles[0] : undefined;
  return {
    id: payload.userId,
    email: payload.email,
    displayName: payload.email,
    role: mapRoleNameToAppRole(firstRole),
    roleLabel: firstRole,
  };
}

type LoginFieldErrors = {
  email?: string;
  password?: string;
  licenseKey?: string;
};

type LoginErrorEnvelope = {
  success?: boolean;
  error?: {
    code?: string;
    message?: string;
  };
  requestId?: string;
};

function mapBackendLoginFieldErrors(payload: unknown): LoginFieldErrors | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const message = (payload as LoginErrorEnvelope).error?.message?.trim();
  if (!message) {
    return null;
  }

  const normalized = message.toLowerCase();
  if (normalized.includes("invalid email")) {
    return { email: message };
  }
  if (normalized.includes("invalid password")) {
    return { password: message };
  }
  if (normalized.includes("invalid license key")) {
    return { licenseKey: message };
  }

  return null;
}

interface LoginResult {
  success: boolean;
  error?: string;
  fieldErrors?: LoginFieldErrors;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const hydrateAuth = async () => {
      try {
        await synchronizeAuthSession();
        const mePayload = await getMe();
        const meUser = extractUserFromMePayload(mePayload);
        const mappedMeUser = meUser ? mapApiUserToUser(meUser) : null;
        if (!mounted) return;
        setUser(mappedMeUser ?? getUserFromAccessToken());
      } catch {
        if (!mounted) return;
        setUser(getUserFromAccessToken());
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    };

    void hydrateAuth();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let active = true;
    const syncFromServer = async () => {
      try {
        await synchronizeAuthSession();
        const mePayload = await getMe();
        const meUser = extractUserFromMePayload(mePayload);
        const mappedMeUser = meUser ? mapApiUserToUser(meUser) : null;
        if (!active) return;
        setUser(mappedMeUser ?? getUserFromAccessToken());
      } catch {
        if (!active) return;
        setUser(getUserFromAccessToken());
      } finally {
        if (!active) return;
        setIsLoading(false);
      }
    };

    // Handles browser back/forward restores (bfcache) and tab focus resumes.
    const handleLifecycleSync = () => {
      void syncFromServer();
    };
    window.addEventListener("pageshow", handleLifecycleSync);
    window.addEventListener("focus", handleLifecycleSync);

    return () => {
      active = false;
      window.removeEventListener("pageshow", handleLifecycleSync);
      window.removeEventListener("focus", handleLifecycleSync);
    };
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<LoginResult> => {
      if (!credentials.email.trim()) {
        return {
          success: false,
          fieldErrors: { email: "Email is required." },
        };
      }
      if (!credentials.password) {
        return {
          success: false,
          fieldErrors: { password: "Password is required." },
        };
      }
      if (!credentials.licenseKey?.trim()) {
        return {
          success: false,
          fieldErrors: { licenseKey: "License key is required." },
        };
      }

      try {
        const response = await loginMutation.mutateAsync({
          email: credentials.email.trim(),
          password: credentials.password,
          licenseKey: credentials.licenseKey.trim(),
        });

        const mappedUser = mapApiUserToUser(response.user);
        if (!mappedUser) {
          return {
            success: false,
            error: "Login succeeded but user profile payload was invalid.",
          };
        }
        setUser(mappedUser);
        router.replace("/dashboard");
        return { success: true };
      } catch (err: unknown) {
        if (isAxiosError(err)) {
          const backendFieldErrors = mapBackendLoginFieldErrors(err.response?.data);
          if (backendFieldErrors) {
            return {
              success: false,
              fieldErrors: backendFieldErrors,
            };
          }

          const status = err.response?.status;
          if (status === 400 || status === 401) {
            return {
              success: false,
              error: "Invalid email, password, or license key.",
            };
          }
          return {
            success: false,
            error: "Login request failed. Please try again.",
          };
        }
        return {
          success: false,
          error: "Unexpected error occurred. Please try again.",
        };
      }
    },
    [loginMutation, router],
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Local session should still be cleared if remote logout fails.
    }
    setUser(null);
    router.push("/login");
  }, [logoutMutation, router]);

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
