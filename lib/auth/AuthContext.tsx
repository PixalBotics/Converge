"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { isAxiosError } from "axios";
import { usePathname, useRouter } from "next/navigation";
import type { User, LoginCredentials } from "./types";
import { getAccessToken, getMe, setTokenPair, synchronizeAuthSession } from "@/api";
import { useLoginMutation, useLogoutMutation } from "@/lib/hooks";
import { extractApiErrorMessageForToast } from "@/lib/notify";
import { APP_PATHS, AUTH_PATHS, shouldSkipRemoteAuthHydration } from "./auth-paths";
import {
  clearImpersonationSession,
  getImpersonationSession,
  isImpersonatingSessionActive,
} from "./impersonation-session";
import {
  extractIsPlatformAdmin,
  extractPermissionsByType,
  hasOperationalPermission,
  hasPagePermission,
  isRbacActive,
  mergePermissionsByType,
  PERMISSION_BUCKET_OPERATIONAL,
  PERMISSION_BUCKET_PAGE,
  toPermissionSet,
  type PermissionsByType,
} from "./permissions-model";
import { resolveDashboardLandingHref } from "@/lib/permissions";
import { useAppearance } from "@/lib/theme/appearance-context";
import { registerAfterTokenSessionSync } from "./after-token-session-sync";

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

function isJwtPlatformAdmin(payload: AccessTokenPayload | null): boolean {
  if (!payload?.roles || !Array.isArray(payload.roles)) return false;
  return payload.roles.some((r) => {
    const s = String(r).toLowerCase().replace(/\s+/g, "");
    return s.includes("platformadmin") || (s.includes("platform") && s.includes("admin"));
  });
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

function extractAccountThemeBackgroundColorFromMePayload(payload: unknown): string | null {
  const user = extractUserFromMePayload(payload);
  if (!user || typeof user !== "object") return null;
  const theme = (user as { theme?: { backgroundColor?: string | null } }).theme;
  const bg = theme?.backgroundColor;
  if (bg == null || String(bg).trim() === "") return null;
  return String(bg).trim();
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
  /** True while `/auth/me` (or post-login permission pull) is updating session permissions. */
  permissionsSyncing: boolean;
  /** Present only when the backend sent at least one permission bucket. */
  permissionsByType: PermissionsByType | undefined;
  rbacEnabled: boolean;
  /** Full module + route bypass (aligned with backend `isPlatformAdmin`). */
  isPlatformAdmin: boolean;
  hasPage: (permission: string) => boolean;
  hasOperational: (permission: string) => boolean;
  isImpersonating: boolean;
  revertImpersonation: () => Promise<boolean>;
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

export type ResolvedAuthSessionSnapshot = {
  permissionsByType: PermissionsByType | undefined;
  isPlatformAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();
  const { applyAccountTheme } = useAppearance();
  const accountThemeFromMeAppliedRef = useRef(false);
  const suppressPostAuthNavPullRef = useRef(false);
  const prevPathnameRef = useRef<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionsSyncing, setPermissionsSyncing] = useState(false);
  const [permissionsByType, setPermissionsByType] = useState<PermissionsByType | undefined>(undefined);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);

  const syncAccountThemeFromMePayload = useCallback(
    (mePayload: unknown, force = false) => {
      if (!force && accountThemeFromMeAppliedRef.current) return;
      if (!extractUserFromMePayload(mePayload)) return;
      const bg = extractAccountThemeBackgroundColorFromMePayload(mePayload);
      applyAccountTheme(bg);
      accountThemeFromMeAppliedRef.current = true;
    },
    [applyAccountTheme],
  );

  const applyLocalAuthFromCookies = useCallback(() => {
    setUser(getUserFromAccessToken());
    setIsImpersonating(isImpersonatingSessionActive());
    setIsPlatformAdmin(isJwtPlatformAdmin(decodeJwtPayload(getAccessToken() ?? "")));
    setIsLoading(false);
  }, []);

  const rbacEnabled = useMemo(() => isRbacActive(permissionsByType), [permissionsByType]);

  const pagePermissionSet = useMemo(
    () => toPermissionSet(permissionsByType?.[PERMISSION_BUCKET_PAGE]),
    [permissionsByType],
  );

  const operationalPermissionSet = useMemo(
    () => toPermissionSet(permissionsByType?.[PERMISSION_BUCKET_OPERATIONAL]),
    [permissionsByType],
  );

  const hasPage = useCallback(
    (permission: string) => {
      if (!rbacEnabled) return true;
      if (isPlatformAdmin) return true;
      return hasPagePermission(pagePermissionSet, permission);
    },
    [rbacEnabled, isPlatformAdmin, pagePermissionSet],
  );

  const hasOperational = useCallback(
    (permission: string) => {
      if (!rbacEnabled) return true;
      if (isPlatformAdmin) return true;
      return hasOperationalPermission(operationalPermissionSet, permission);
    },
    [rbacEnabled, isPlatformAdmin, operationalPermissionSet],
  );

  type PullRemotePermissionMode =
    | { type: "replace" }
    | { type: "merge"; login: PermissionsByType | undefined };

  /**
   * Pulls `/auth/me` with permission breakdown after tokens change.
   * Used on sign-in (merge with login payload) and after login-as (replace).
   * Returns the merged permission snapshot for immediate routing (React state is not readable synchronously after `await`).
   */
  const pullRemoteAuthSession = useCallback(
    async (permissionMode: PullRemotePermissionMode): Promise<ResolvedAuthSessionSnapshot> => {
      setPermissionsSyncing(true);
      const jwtAdminFallback = isJwtPlatformAdmin(decodeJwtPayload(getAccessToken() ?? ""));
      try {
        await synchronizeAuthSession();
        const mePayload = await getMe({ permissionsBreakdown: true });
        const meUser = extractUserFromMePayload(mePayload);
        const mappedMeUser = meUser ? mapApiUserToUser(meUser) : null;
        const fromMe = extractPermissionsByType(mePayload);
        const mergedPermissions =
          permissionMode.type === "merge"
            ? (mergePermissionsByType(permissionMode.login, fromMe) ?? fromMe ?? permissionMode.login)
            : fromMe;
        const platformAdmin =
          extractIsPlatformAdmin(mePayload) || isJwtPlatformAdmin(decodeJwtPayload(getAccessToken() ?? ""));
        flushSync(() => {
          setPermissionsByType(mergedPermissions ?? undefined);
          setUser(mappedMeUser ?? getUserFromAccessToken());
          setIsImpersonating(isImpersonatingSessionActive());
          setIsPlatformAdmin(platformAdmin);
        });
        syncAccountThemeFromMePayload(mePayload, true);
        return { permissionsByType: mergedPermissions ?? undefined, isPlatformAdmin: platformAdmin };
      } catch {
        if (permissionMode.type === "merge") {
          const snapshot: ResolvedAuthSessionSnapshot = {
            permissionsByType: permissionMode.login ?? undefined,
            isPlatformAdmin: jwtAdminFallback,
          };
          flushSync(() => {
            setPermissionsByType(snapshot.permissionsByType);
            setUser(getUserFromAccessToken());
            setIsImpersonating(isImpersonatingSessionActive());
            setIsPlatformAdmin(snapshot.isPlatformAdmin);
          });
          return snapshot;
        }
        const snapshot: ResolvedAuthSessionSnapshot = {
          permissionsByType: undefined,
          isPlatformAdmin: jwtAdminFallback,
        };
        setUser(getUserFromAccessToken());
        setIsImpersonating(isImpersonatingSessionActive());
        setIsPlatformAdmin(snapshot.isPlatformAdmin);
        return snapshot;
      } finally {
        setPermissionsSyncing(false);
      }
    },
    [syncAccountThemeFromMePayload],
  );

  useEffect(() => {
    registerAfterTokenSessionSync(async () => {
      await pullRemoteAuthSession({ type: "replace" });
    });
    return () => registerAfterTokenSessionSync(null);
  }, [pullRemoteAuthSession]);

  /**
   * Client navigation from `/auth/*` into the app does not re-run the initial hydrate effect.
   * Pull `/auth/me` once on that transition so sidebar + RBAC stay in sync (e.g. cookie session).
   */
  useEffect(() => {
    const prev = prevPathnameRef.current;
    const current = pathname;
    if (prev !== null && getAccessToken()) {
      if (shouldSkipRemoteAuthHydration(prev) && !shouldSkipRemoteAuthHydration(current)) {
        if (suppressPostAuthNavPullRef.current) {
          suppressPostAuthNavPullRef.current = false;
        } else {
          void pullRemoteAuthSession({ type: "merge", login: undefined });
        }
      }
    }
    prevPathnameRef.current = current;
  }, [pathname, pullRemoteAuthSession]);

  /** Public auth pages: no `/auth/me`, verify, or refresh on load/focus. */
  const isSkipHydrationPath = useCallback(() => {
    if (typeof window === "undefined") return false;
    return shouldSkipRemoteAuthHydration(window.location.pathname);
  }, []);

  useEffect(() => {
    let mounted = true;

    const hydrateAuth = async () => {
      if (isSkipHydrationPath()) {
        if (!mounted) return;
        applyLocalAuthFromCookies();
        return;
      }

      try {
        await synchronizeAuthSession();
        if (!mounted) return;
        if (isSkipHydrationPath()) {
          applyLocalAuthFromCookies();
          return;
        }
        const mePayload = await getMe({ permissionsBreakdown: true });
        const meUser = extractUserFromMePayload(mePayload);
        const mappedMeUser = meUser ? mapApiUserToUser(meUser) : null;
        if (!mounted) return;
        setPermissionsByType((prev) => {
          const incoming = extractPermissionsByType(mePayload);
          if (!incoming) return prev;
          return mergePermissionsByType(prev, incoming);
        });
        setUser(mappedMeUser ?? getUserFromAccessToken());
        setIsImpersonating(isImpersonatingSessionActive());
        setIsPlatformAdmin(
          extractIsPlatformAdmin(mePayload) || isJwtPlatformAdmin(decodeJwtPayload(getAccessToken() ?? "")),
        );
        syncAccountThemeFromMePayload(mePayload);
      } catch {
        if (!mounted) return;
        if (isSkipHydrationPath()) {
          applyLocalAuthFromCookies();
          return;
        }
        setUser(getUserFromAccessToken());
        setIsImpersonating(isImpersonatingSessionActive());
        setIsPlatformAdmin(isJwtPlatformAdmin(decodeJwtPayload(getAccessToken() ?? "")));
      } finally {
        if (!mounted) return;
        if (!isSkipHydrationPath()) {
          setIsLoading(false);
        }
      }
    };

    void hydrateAuth();

    return () => {
      mounted = false;
    };
  }, [applyLocalAuthFromCookies, isSkipHydrationPath, syncAccountThemeFromMePayload]);

  /** Client navigations to `/auth/login` etc. must not keep dashboard user without re-evaluating cookies. */
  useEffect(() => {
    if (!shouldSkipRemoteAuthHydration(pathname)) return;
    applyLocalAuthFromCookies();
  }, [pathname, applyLocalAuthFromCookies]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let active = true;
    const syncFromServer = async () => {
      if (isSkipHydrationPath()) {
        return;
      }
      try {
        await synchronizeAuthSession();
        if (!active) return;
        if (isSkipHydrationPath()) {
          return;
        }
        const mePayload = await getMe({ permissionsBreakdown: true });
        const meUser = extractUserFromMePayload(mePayload);
        const mappedMeUser = meUser ? mapApiUserToUser(meUser) : null;
        if (!active) return;
        setPermissionsByType((prev) => {
          const incoming = extractPermissionsByType(mePayload);
          if (!incoming) return prev;
          return mergePermissionsByType(prev, incoming);
        });
        setUser(mappedMeUser ?? getUserFromAccessToken());
        setIsImpersonating(isImpersonatingSessionActive());
        setIsPlatformAdmin(
          extractIsPlatformAdmin(mePayload) || isJwtPlatformAdmin(decodeJwtPayload(getAccessToken() ?? "")),
        );
        syncAccountThemeFromMePayload(mePayload);
      } catch {
        if (!active) return;
        if (isSkipHydrationPath()) {
          return;
        }
        setUser(getUserFromAccessToken());
        setIsImpersonating(isImpersonatingSessionActive());
        setIsPlatformAdmin(isJwtPlatformAdmin(decodeJwtPayload(getAccessToken() ?? "")));
      } finally {
        if (!active) return;
        if (!isSkipHydrationPath()) {
          setIsLoading(false);
        }
      }
    };

    // Handles browser back/forward restores (bfcache) and tab focus resumes.
    const handleLifecycleSync = () => {
      if (isSkipHydrationPath()) {
        return;
      }
      void syncFromServer();
    };
    window.addEventListener("pageshow", handleLifecycleSync);
    window.addEventListener("focus", handleLifecycleSync);

    return () => {
      active = false;
      window.removeEventListener("pageshow", handleLifecycleSync);
      window.removeEventListener("focus", handleLifecycleSync);
    };
  }, [isSkipHydrationPath, syncAccountThemeFromMePayload]);

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
        const loginPerms = extractPermissionsByType(response);
        applyAccountTheme(response.user.theme?.backgroundColor ?? null);
        accountThemeFromMeAppliedRef.current = true;
        /**
         * Commit login payload (PAGE + OPERATIONAL) synchronously so the first dashboard paint
         * already has RBAC state; then merge with `/auth/me` for a single source of truth.
         */
        flushSync(() => {
          setUser(mappedUser);
          if (loginPerms) {
            setPermissionsByType(loginPerms);
          }
          setIsPlatformAdmin(
            extractIsPlatformAdmin(response) || isJwtPlatformAdmin(decodeJwtPayload(getAccessToken() ?? "")),
          );
        });
        /**
         * Initial `/auth` mount skips `/auth/me`, and client navigation to the dashboard
         * does not re-run that hydrate effect — load permissions here so sidebar + RBAC
         * match without a manual refresh.
         */
        const session = await pullRemoteAuthSession({ type: "merge", login: loginPerms });
        suppressPostAuthNavPullRef.current = true;
        const isDemoUser = mappedUser.email.trim().toLowerCase() === "demo@gmail.com";
        const landing = resolveDashboardLandingHref({
          permissionsByType: session.permissionsByType,
          isPlatformAdmin: session.isPlatformAdmin,
          isDemoUser,
        });
        queueMicrotask(() => {
          router.replace(landing);
        });
        return { success: true };
      } catch (err: unknown) {
        if (isAxiosError(err)) {
          const surfacedInToast = extractApiErrorMessageForToast(err);
          if (surfacedInToast) {
            /**
             * `MutationCache` already showed this message in a toast; do not also
             * map the same failure to red `react-hook-form` fields on the login page.
             */
            return { success: false };
          }

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
    [applyAccountTheme, loginMutation, pullRemoteAuthSession, router],
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Local session should still be cleared if remote logout fails.
    }
    setUser(null);
    setPermissionsByType(undefined);
    setPermissionsSyncing(false);
    setIsPlatformAdmin(false);
    setIsImpersonating(false);
    accountThemeFromMeAppliedRef.current = false;
    router.push(AUTH_PATHS.login);
  }, [logoutMutation, router]);

  const revertImpersonation = useCallback(async (): Promise<boolean> => {
    const session = getImpersonationSession();
    if (!session?.originalTokenPair) {
      setIsImpersonating(false);
      return false;
    }
    try {
      setTokenPair(session.originalTokenPair);
      const mePayload = await getMe({ permissionsBreakdown: true });
      const meUser = extractUserFromMePayload(mePayload);
      const mappedMeUser = meUser ? mapApiUserToUser(meUser) : null;
      const incoming = extractPermissionsByType(mePayload);
      const platformAdmin =
        extractIsPlatformAdmin(mePayload) || isJwtPlatformAdmin(decodeJwtPayload(getAccessToken() ?? ""));
      let mergedPermissions: PermissionsByType | undefined;
      flushSync(() => {
        setPermissionsByType((prev) => {
          const merged = mergePermissionsByType(prev, incoming) ?? incoming ?? prev;
          mergedPermissions = merged ?? undefined;
          return merged ?? undefined;
        });
        setUser(mappedMeUser ?? getUserFromAccessToken());
        setIsPlatformAdmin(platformAdmin);
      });
      clearImpersonationSession();
      setIsImpersonating(false);
      accountThemeFromMeAppliedRef.current = false;
      syncAccountThemeFromMePayload(mePayload, true);
      const actor = mappedMeUser ?? getUserFromAccessToken();
      const isDemoUser = actor?.email?.trim().toLowerCase() === "demo@gmail.com";
      router.replace(
        resolveDashboardLandingHref({
          permissionsByType: mergedPermissions,
          isPlatformAdmin: platformAdmin,
          isDemoUser: Boolean(isDemoUser),
        }),
      );
      return true;
    } catch {
      return false;
    }
  }, [router, syncAccountThemeFromMePayload]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      permissionsSyncing,
      permissionsByType,
      rbacEnabled,
      isPlatformAdmin,
      hasPage,
      hasOperational,
      isImpersonating,
      revertImpersonation,
      login,
      logout,
    }),
    [
      user,
      isLoading,
      permissionsSyncing,
      permissionsByType,
      rbacEnabled,
      isPlatformAdmin,
      hasPage,
      hasOperational,
      isImpersonating,
      revertImpersonation,
      login,
      logout,
    ],
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
