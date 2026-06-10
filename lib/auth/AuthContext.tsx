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
import type { AuthUserType, User, LoginCredentials } from "./types";
import {
  applyLoginAsTokenPair,
  getAccessToken,
  getMe,
  getRefreshToken,
  registerAuthSessionTeardown,
  refreshSessionWithStoredRefresh,
  resetAuthSessionTerminatedFlag,
  setTokenPair,
  synchronizeAuthSession,
} from "@/api";
import type { LoginSuccessData } from "@/api";
import { isAuthSessionTerminated } from "@/api/session/terminate-auth-session";
import { useLoginMutation, useLogoutMutation } from "@/lib/hooks";
import { clearAppQueryCache } from "@/lib/hooks/query/core/app-query-cache";
import { extractApiErrorMessageForToast } from "@/lib/notify";
import { AUTH_PATHS, shouldSkipRemoteAuthHydration } from "./auth-paths";
import { clearClientAuthStorage } from "./clear-client-auth-state";
import { sessionExpiredLoginHref } from "./session-expired-login";
import { registerApplyLoginAsSession } from "./apply-login-as-session";
import {
  beginAuthTransition,
  endAuthTransition,
} from "./auth-transition";
import {
  disconnectSharedAgentChat,
} from "@/services/chat/sharedAgentChatSocket";
import { disconnectSharedNotifications } from "@/services/notifications/notificationsSocket";
import {
  clearImpersonationSession,
  getImpersonationSession,
  isImpersonatingSessionActive,
  setImpersonationSession,
} from "./impersonation-session";
import {
  snapshotFromAuthApiUser,
  userFromImpersonationSnapshot,
} from "./impersonation-user";
import { createPermissionCan } from "@/lib/permissions/access-helpers";
import {
  resolveIsPlatformAdmin,
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
import { dismissAppBoundary, publishAuthErrorBoundary } from "@/lib/app-boundaries";
import { classifyApiError, isTransientNetworkError } from "@/lib/app-boundaries/classify-api-error";
import { isAccessTokenExpiringSoon } from "./access-token";
import {
  initTokenCrossTabSync,
  registerCrossTabTokenListener,
} from "./token-cross-tab-sync";
import { extractResellerIdFromMePayload } from "./extract-reseller-id";
import { resolveDashboardLandingHref } from "@/lib/permissions";
import { useAppearance } from "@/lib/theme/appearance-context";
import { registerAfterTokenSessionSync } from "./after-token-session-sync";
import { registerSessionHydrationRetry } from "./session-hydration-retry";

export type AuthGateState = "loading" | "ready" | "blocked";

type AccessTokenPayload = {
  userId?: string;
  email?: string;
  roles?: string[];
  userType?: string;
  resellerId?: string;
  parentCompanyId?: string;
  wideResellerScope?: boolean;
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
  userType?: string | null;
  user_type?: string | null;
  poolId?: string;
  pool?: { id?: string; name?: string; poolId?: string };
  resellerId?: string;
  reseller_id?: string;
  wideResellerScope?: boolean;
  wide_reseller_scope?: boolean;
  parentCompanyId?: string;
  parent_company_id?: string;
  isPoolHead?: boolean;
};

function parseApiUserType(user: ApiUser): AuthUserType | undefined {
  const raw = user.userType ?? user.user_type;
  if (raw == null || String(raw).trim() === "") return undefined;
  const n = String(raw).trim().toLowerCase();
  if (n === "internal") return "Internal";
  if (n === "external") return "External";
  return undefined;
}

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

function resolvePlatformAdminFromAuthPayload(
  payload: unknown,
  options?: { impersonating?: boolean },
): boolean {
  if (options?.impersonating) {
    return resolveIsPlatformAdmin(payload);
  }
  return resolveIsPlatformAdmin(payload, () =>
    isJwtPlatformAdmin(decodeJwtPayload(getAccessToken() ?? "")),
  );
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
  const poolObj = user.pool;
  const poolId =
    (typeof user.poolId === "string" && user.poolId.trim()) ||
    (typeof poolObj?.id === "string" && poolObj.id.trim()) ||
    (typeof poolObj?.poolId === "string" && poolObj.poolId.trim()) ||
    undefined;
  const poolName =
    (typeof poolObj?.name === "string" && poolObj.name.trim()) || undefined;
  const resellerId =
    (typeof user.resellerId === "string" && user.resellerId.trim()) ||
    (typeof user.reseller_id === "string" && user.reseller_id.trim()) ||
    undefined;
  const wr: unknown = user.wideResellerScope ?? user.wide_reseller_scope;
  const roleName =
    (typeof user.role === "object" &&
      user.role &&
      typeof (user.role as { name?: string }).name === "string" &&
      (user.role as { name: string }).name.trim()) ||
    undefined;
  const wideResellerScope =
    wr === true ||
    wr === "true" ||
    wr === 1 ||
    wr === "1" ||
    (parseApiUserType(user) === "External" && roleName === "Reseller Admin");
  const parentCompanyId =
    (typeof user.parentCompanyId === "string" && user.parentCompanyId.trim()) ||
    (typeof user.parent_company_id === "string" && user.parent_company_id.trim()) ||
    undefined;
  return {
    id: user.id,
    email: user.email,
    displayName: toDisplayName(user) || user.email,
    role: mapRoleNameToAppRole(roleName),
    roleLabel: roleName?.trim() || undefined,
    userType: parseApiUserType(user),
    poolId,
    poolName,
    isPoolHead: user.isPoolHead === true,
    resellerId,
    wideResellerScope,
    parentCompanyId,
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
  const resellerId =
    typeof payload.resellerId === "string" && payload.resellerId.trim()
      ? payload.resellerId.trim()
      : undefined;
  const parentCompanyId =
    typeof payload.parentCompanyId === "string" && payload.parentCompanyId.trim()
      ? payload.parentCompanyId.trim()
      : undefined;
  const wideFromJwt = payload.wideResellerScope === true;
  const wideFromRole =
    payload.userType === "External" && firstRole?.trim() === "Reseller Admin";
  return {
    id: payload.userId,
    email: payload.email,
    displayName: payload.email,
    role: mapRoleNameToAppRole(firstRole),
    roleLabel: firstRole,
    userType: payload.userType === "External" ? "External" : payload.userType === "Internal" ? "Internal" : undefined,
    resellerId,
    wideResellerScope: wideFromJwt || wideFromRole,
    parentCompanyId,
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
  /**
   * `blocked` — verify/me failed (network/server); dashboard shell must not render.
   * Boundary modal is shown via {@link publishAuthErrorBoundary}.
   */
  authGate: AuthGateState;
  /** True while `/auth/me` (or post-login permission pull) is updating session permissions. */
  permissionsSyncing: boolean;
  /** Present only when the backend sent at least one permission bucket. */
  permissionsByType: PermissionsByType | undefined;
  rbacEnabled: boolean;
  /** Full module + route bypass (aligned with backend `isPlatformAdmin`). */
  isPlatformAdmin: boolean;
  hasPage: (permission: string) => boolean;
  hasOperational: (permission: string) => boolean;
  /** Expanded PAGE bucket from `/auth/me` (do not use raw role codes). */
  pagePermissions: readonly string[];
  /** Expanded OPERATIONAL bucket from `/auth/me`. */
  operationalPermissions: readonly string[];
  /** `page` OR `operational` — mirrors backend expanded effective permissions. */
  can: (code: string) => boolean;
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
  const [authGate, setAuthGate] = useState<AuthGateState>("loading");

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

  const resolveUserForImpersonation = useCallback((): User | null => {
    const session = getImpersonationSession();
    const fromSnapshot = userFromImpersonationSnapshot(session?.impersonatedUser);
    if (fromSnapshot) return fromSnapshot;

    const jwtUser = getUserFromAccessToken();
    if (jwtUser && session?.impersonatedUserId) {
      if (jwtUser.id === session.impersonatedUserId) return jwtUser;
      return null;
    }
    return jwtUser;
  }, []);

  const applyLocalAuthFromCookies = useCallback(() => {
    if (isAuthSessionTerminated()) {
      setUser(null);
      setPermissionsByType(undefined);
      setIsPlatformAdmin(false);
      setIsImpersonating(false);
      setAuthGate("ready");
      setIsLoading(false);
      return;
    }
    const impersonating = isImpersonatingSessionActive();
    setUser(impersonating ? resolveUserForImpersonation() : getUserFromAccessToken());
    setIsImpersonating(impersonating);
    setIsPlatformAdmin(
      impersonating
        ? false
        : isJwtPlatformAdmin(decodeJwtPayload(getAccessToken() ?? "")),
    );
    setAuthGate("ready");
    setIsLoading(false);
  }, [resolveUserForImpersonation]);

  /** Public auth routes must not treat cookie JWT as a live session (keeps login form editable). */
  const preparePublicAuthRoute = useCallback(() => {
    setUser(null);
    setPermissionsByType(undefined);
    setIsPlatformAdmin(false);
    setIsImpersonating(false);
    setAuthGate("ready");
    setIsLoading(false);
  }, []);

  const redirectToExpiredLogin = useCallback(() => {
    clearClientAuthStorage();
    setUser(null);
    setPermissionsByType(undefined);
    setIsPlatformAdmin(false);
    setIsImpersonating(false);
    setAuthGate("ready");
    setIsLoading(false);
    accountThemeFromMeAppliedRef.current = false;
    router.replace(sessionExpiredLoginHref());
  }, [router]);

  const allowAuthSession = useCallback(() => {
    dismissAppBoundary();
    setAuthGate("ready");
  }, []);

  /** Public auth pages: no `/auth/me`, verify, or refresh on load/focus. */
  const isSkipHydrationPath = useCallback(() => {
    if (typeof window === "undefined") return false;
    return shouldSkipRemoteAuthHydration(window.location.pathname);
  }, []);

  const blockAuthSession = useCallback(
    (error?: unknown) => {
      if (isAuthSessionTerminated()) return;
      if (isSkipHydrationPath()) return;

      void (async () => {
        if (
          isAxiosError(error) &&
          error.response?.status === 401 &&
          getRefreshToken()
        ) {
          try {
            await refreshSessionWithStoredRefresh();
            if (isAuthSessionTerminated()) return;
            allowAuthSession();
            dismissAppBoundary("session_expired");
            return;
          } catch (refreshErr) {
            if (isTransientNetworkError(refreshErr)) {
              applyLocalAuthFromCookies();
              publishAuthErrorBoundary(refreshErr);
              return;
            }
            /* refresh exhausted — real session expiry */
          }
        }

        if (isAuthSessionTerminated()) return;

        if (error != null) {
          const classified = classifyApiError(error);
          if (classified.kind === "network") {
            publishAuthErrorBoundary(error);
            return;
          }
        }

        redirectToExpiredLogin();
        publishAuthErrorBoundary(error);
      })();
    },
    [allowAuthSession, applyLocalAuthFromCookies, isSkipHydrationPath, redirectToExpiredLogin],
  );

  const handleTransientSessionSyncFailure = useCallback(
    (error?: unknown) => {
      if (isSkipHydrationPath()) return;
      applyLocalAuthFromCookies();
      allowAuthSession();
      publishAuthErrorBoundary(error);
    },
    [allowAuthSession, applyLocalAuthFromCookies, isSkipHydrationPath],
  );

  const rbacEnabled = useMemo(() => isRbacActive(permissionsByType), [permissionsByType]);

  const pagePermissionSet = useMemo(
    () => toPermissionSet(permissionsByType?.[PERMISSION_BUCKET_PAGE]),
    [permissionsByType],
  );

  const operationalPermissionSet = useMemo(
    () => toPermissionSet(permissionsByType?.[PERMISSION_BUCKET_OPERATIONAL]),
    [permissionsByType],
  );

  const pagePermissions = useMemo(
    () => permissionsByType?.[PERMISSION_BUCKET_PAGE] ?? [],
    [permissionsByType],
  );

  const operationalPermissions = useMemo(
    () => permissionsByType?.[PERMISSION_BUCKET_OPERATIONAL] ?? [],
    [permissionsByType],
  );

  const can = useMemo(
    () =>
      createPermissionCan({
        page: pagePermissions,
        operational: operationalPermissions,
        isPlatformAdmin,
      }),
    [pagePermissions, operationalPermissions, isPlatformAdmin],
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
        const session = await synchronizeAuthSession();
        if (session.status === "invalid") {
          return {
            permissionsByType: undefined,
            isPlatformAdmin: jwtAdminFallback,
          };
        }
        if (session.status === "unreachable" || session.status === "error") {
          handleTransientSessionSyncFailure(session.error);
          return {
            permissionsByType: undefined,
            isPlatformAdmin: jwtAdminFallback,
          };
        }
        const mePayload = await getMe({ permissionsBreakdown: true });
        const meUser = extractUserFromMePayload(mePayload);
        let mappedMeUser = meUser ? mapApiUserToUser(meUser) : null;
        const meResellerId = extractResellerIdFromMePayload(mePayload);
        if (mappedMeUser && meResellerId && !mappedMeUser.resellerId) {
          mappedMeUser = { ...mappedMeUser, resellerId: meResellerId };
        }
        const fromMe = extractPermissionsByType(mePayload);
        const mergedPermissions =
          permissionMode.type === "merge"
            ? (mergePermissionsByType(permissionMode.login, fromMe) ?? fromMe ?? permissionMode.login)
            : fromMe;
        const impersonating = isImpersonatingSessionActive();
        const platformAdmin = resolvePlatformAdminFromAuthPayload(mePayload, {
          impersonating,
        });
        flushSync(() => {
          setPermissionsByType(mergedPermissions ?? undefined);
          setUser(
            mappedMeUser ??
              (impersonating ? resolveUserForImpersonation() : getUserFromAccessToken()),
          );
          setIsImpersonating(impersonating);
          setIsPlatformAdmin(platformAdmin);
        });
        syncAccountThemeFromMePayload(mePayload, true);
        allowAuthSession();
        return { permissionsByType: mergedPermissions ?? undefined, isPlatformAdmin: platformAdmin };
      } catch (err: unknown) {
        blockAuthSession(err);
        return {
          permissionsByType: undefined,
          isPlatformAdmin: jwtAdminFallback,
        };
      } finally {
        setPermissionsSyncing(false);
      }
    },
    [
      allowAuthSession,
      blockAuthSession,
      handleTransientSessionSyncFailure,
      resolveUserForImpersonation,
      syncAccountThemeFromMePayload,
    ],
  );

  /** Apply impersonated user + permissions from login-as response (replace, never merge). */
  const applyLoginAsSessionFromResponse = useCallback(
    (response: LoginSuccessData) => {
      applyLoginAsTokenPair(response);
      const loginPerms = extractPermissionsByType(response);
      const mappedUser = mapApiUserToUser(response.user as ApiUser);
      const impersonatedSnapshot = snapshotFromAuthApiUser(response.user);
      const existing = getImpersonationSession();
      if (existing && impersonatedSnapshot) {
        setImpersonationSession({
          ...existing,
          impersonatedUser: impersonatedSnapshot,
        });
      }
      const platformAdmin = resolvePlatformAdminFromAuthPayload(response);

      flushSync(() => {
        setPermissionsByType(loginPerms ?? undefined);
        setUser(mappedUser ?? userFromImpersonationSnapshot(impersonatedSnapshot));
        setIsImpersonating(isImpersonatingSessionActive());
        setIsPlatformAdmin(platformAdmin);
        setAuthGate("ready");
        setIsLoading(false);
      });
      applyAccountTheme(response.user?.theme?.backgroundColor ?? null);
      accountThemeFromMeAppliedRef.current = true;
      allowAuthSession();
    },
    [allowAuthSession, applyAccountTheme],
  );

  useEffect(() => {
    registerApplyLoginAsSession(applyLoginAsSessionFromResponse);
    return () => registerApplyLoginAsSession(null);
  }, [applyLoginAsSessionFromResponse]);

  useEffect(() => {
    registerAfterTokenSessionSync(async () => {
      await pullRemoteAuthSession({ type: "replace" });
    });
    return () => registerAfterTokenSessionSync(null);
  }, [pullRemoteAuthSession]);

  useEffect(() => {
    registerCrossTabTokenListener((payload) => {
      if (isImpersonatingSessionActive()) return;
      setTokenPair(
        {
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
        },
        {
          accessExpiresIn: payload.accessExpiresIn,
          refreshExpiresIn: payload.refreshExpiresIn,
        },
      );
      void pullRemoteAuthSession({ type: "merge", login: undefined });
    });
    return initTokenCrossTabSync();
  }, [pullRemoteAuthSession]);

  useEffect(() => {
    registerAuthSessionTeardown(async ({ reason }) => {
      setUser(null);
      setPermissionsByType(undefined);
      setPermissionsSyncing(false);
      setIsPlatformAdmin(false);
      setIsImpersonating(false);
      setIsLoading(false);
      setAuthGate("ready");
      accountThemeFromMeAppliedRef.current = false;
      const query =
        reason === "refresh_failed" || reason === "verify_failed"
          ? "?session=expired"
          : "";
      router.replace(`${AUTH_PATHS.login}${query}`);
    });
    return () => registerAuthSessionTeardown(null);
  }, [router]);

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

  const recoverImpersonationSession = useCallback(async (): Promise<boolean> => {
    if (!isImpersonatingSessionActive() || !(getAccessToken() || getRefreshToken())) {
      return false;
    }

    applyLocalAuthFromCookies();
    beginAuthTransition("impersonation-hydrate");
    try {
      const mePayload = await getMe({ permissionsBreakdown: true });
      const meUser = extractUserFromMePayload(mePayload);
      const mappedMeUser = meUser ? mapApiUserToUser(meUser) : null;
      const fromMe = extractPermissionsByType(mePayload);
      flushSync(() => {
        setPermissionsByType(fromMe ?? undefined);
        setUser(mappedMeUser ?? resolveUserForImpersonation());
        setIsImpersonating(true);
        setIsPlatformAdmin(resolvePlatformAdminFromAuthPayload(mePayload, { impersonating: true }));
      });
      syncAccountThemeFromMePayload(mePayload);
      allowAuthSession();
      return true;
    } catch {
      applyLocalAuthFromCookies();
      allowAuthSession();
      return true;
    } finally {
      endAuthTransition();
    }
  }, [
    allowAuthSession,
    applyLocalAuthFromCookies,
    resolveUserForImpersonation,
    syncAccountThemeFromMePayload,
  ]);

  const runSessionHydration = useCallback(async () => {
    if (isSkipHydrationPath()) {
      preparePublicAuthRoute();
      return;
    }

    setAuthGate("loading");
    setIsLoading(true);

    try {
      const session = await synchronizeAuthSession();
      if (isSkipHydrationPath()) {
        preparePublicAuthRoute();
        return;
      }

      if (session.status === "invalid") {
        if (await recoverImpersonationSession()) {
          return;
        }
        redirectToExpiredLogin();
        return;
      }

      if (session.status === "anonymous") {
        setUser(null);
        setPermissionsByType(undefined);
        setIsPlatformAdmin(false);
        setIsImpersonating(false);
        setAuthGate("ready");
        return;
      }

      if (session.status === "unreachable" || session.status === "error") {
        handleTransientSessionSyncFailure(session.error);
        return;
      }

      const mePayload = await getMe({ permissionsBreakdown: true });
      const meUser = extractUserFromMePayload(mePayload);
      const mappedMeUser = meUser ? mapApiUserToUser(meUser) : null;
      const impersonating = isImpersonatingSessionActive();
      const incoming = extractPermissionsByType(mePayload);
      setPermissionsByType((prev) => {
        if (!incoming) return prev;
        return impersonating ? incoming : mergePermissionsByType(prev, incoming);
      });
      setUser(
        mappedMeUser ?? (impersonating ? resolveUserForImpersonation() : getUserFromAccessToken()),
      );
      setIsImpersonating(impersonating);
      setIsPlatformAdmin(
        resolvePlatformAdminFromAuthPayload(mePayload, { impersonating }),
      );
      syncAccountThemeFromMePayload(mePayload);
      allowAuthSession();
    } catch (err: unknown) {
      if (isSkipHydrationPath()) {
        preparePublicAuthRoute();
        return;
      }
      if (await recoverImpersonationSession()) {
        return;
      }
      blockAuthSession(err);
    } finally {
      if (!isSkipHydrationPath()) {
        setIsLoading(false);
      }
    }
  }, [
    allowAuthSession,
    blockAuthSession,
    handleTransientSessionSyncFailure,
    isSkipHydrationPath,
    preparePublicAuthRoute,
    recoverImpersonationSession,
    redirectToExpiredLogin,
    resolveUserForImpersonation,
    syncAccountThemeFromMePayload,
  ]);

  useEffect(() => {
    void runSessionHydration();
  }, [runSessionHydration]);

  useEffect(() => {
    registerSessionHydrationRetry(runSessionHydration);
    return () => registerSessionHydrationRetry(null);
  }, [runSessionHydration]);

  /** Client navigations to `/auth/login` etc. must not keep dashboard user without re-evaluating cookies. */
  useEffect(() => {
    if (!shouldSkipRemoteAuthHydration(pathname)) return;
    preparePublicAuthRoute();
  }, [pathname, preparePublicAuthRoute]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let active = true;
    const syncFromServer = async () => {
      if (isSkipHydrationPath()) {
        return;
      }
      const access = getAccessToken();
      const refresh = getRefreshToken();
      if (!access && !refresh) {
        return;
      }
      if (access && !isAccessTokenExpiringSoon(access)) {
        return;
      }
      try {
        const session = await synchronizeAuthSession();
        if (!active) return;
        if (isSkipHydrationPath()) {
          return;
        }
        if (session.status === "invalid") {
          return;
        }
        if (session.status === "unreachable" || session.status === "error") {
          handleTransientSessionSyncFailure(session.error);
          return;
        }
        const mePayload = await getMe({ permissionsBreakdown: true });
        const meUser = extractUserFromMePayload(mePayload);
        let mappedMeUser = meUser ? mapApiUserToUser(meUser) : null;
        const meResellerId = extractResellerIdFromMePayload(mePayload);
        if (mappedMeUser && meResellerId && !mappedMeUser.resellerId) {
          mappedMeUser = { ...mappedMeUser, resellerId: meResellerId };
        }
        if (!active) return;
        setPermissionsByType((prev) => {
          const incoming = extractPermissionsByType(mePayload);
          if (!incoming) return prev;
          return mergePermissionsByType(prev, incoming);
        });
        setUser(mappedMeUser ?? getUserFromAccessToken());
        setIsImpersonating(isImpersonatingSessionActive());
        setIsPlatformAdmin(resolvePlatformAdminFromAuthPayload(mePayload));
        syncAccountThemeFromMePayload(mePayload);
        allowAuthSession();
      } catch (err: unknown) {
        if (!active) return;
        if (isSkipHydrationPath()) {
          return;
        }
        const classified = classifyApiError(err);
        if (classified.kind === "network") {
          handleTransientSessionSyncFailure(err);
          return;
        }
        blockAuthSession(err);
      }
    };

    let focusDebounce: ReturnType<typeof setTimeout> | null = null;

    // Handles browser back/forward restores (bfcache) and tab focus resumes.
    const handleLifecycleSync = () => {
      if (isSkipHydrationPath()) {
        return;
      }
      const access = getAccessToken();
      const refresh = getRefreshToken();
      if (!access && !refresh) {
        return;
      }
      if (access && !isAccessTokenExpiringSoon(access)) {
        return;
      }
      if (focusDebounce) clearTimeout(focusDebounce);
      focusDebounce = setTimeout(() => {
        focusDebounce = null;
        void syncFromServer();
      }, 400);
    };

    const handleOnline = () => {
      if (isSkipHydrationPath()) return;
      if (focusDebounce) clearTimeout(focusDebounce);
      focusDebounce = null;
      void syncFromServer();
    };

    window.addEventListener("pageshow", handleLifecycleSync);
    window.addEventListener("focus", handleLifecycleSync);
    window.addEventListener("online", handleOnline);

    return () => {
      active = false;
      if (focusDebounce) clearTimeout(focusDebounce);
      window.removeEventListener("pageshow", handleLifecycleSync);
      window.removeEventListener("focus", handleLifecycleSync);
      window.removeEventListener("online", handleOnline);
    };
  }, [
    allowAuthSession,
    blockAuthSession,
    handleTransientSessionSyncFailure,
    isSkipHydrationPath,
    syncAccountThemeFromMePayload,
  ]);

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
        resetAuthSessionTerminatedFlag();
        /**
         * Commit login payload (PAGE + OPERATIONAL) synchronously so the first dashboard paint
         * already has RBAC state; then merge with `/auth/me` for a single source of truth.
         */
        flushSync(() => {
          setUser(mappedUser);
          if (loginPerms) {
            setPermissionsByType(loginPerms);
          }
          setIsPlatformAdmin(resolvePlatformAdminFromAuthPayload(response));
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
    disconnectSharedAgentChat(true);
    disconnectSharedNotifications(true);
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Local session should still be cleared if remote logout fails.
    }
    resetAuthSessionTerminatedFlag();
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
    beginAuthTransition("revert-impersonation");
    try {
      clearAppQueryCache();
      setTokenPair(session.originalTokenPair);
      const mePayload = await getMe({ permissionsBreakdown: true });
      const meUser = extractUserFromMePayload(mePayload);
      const mappedMeUser = meUser ? mapApiUserToUser(meUser) : null;
      const incoming = extractPermissionsByType(mePayload);
      const platformAdmin = resolvePlatformAdminFromAuthPayload(mePayload);
      let restoredPermissions: PermissionsByType | undefined;
      flushSync(() => {
        restoredPermissions = incoming ?? undefined;
        setPermissionsByType(restoredPermissions);
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
          permissionsByType: restoredPermissions,
          isPlatformAdmin: platformAdmin,
          isDemoUser: Boolean(isDemoUser),
        }),
      );
      return true;
    } catch {
      return false;
    } finally {
      endAuthTransition();
    }
  }, [router, syncAccountThemeFromMePayload]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: authGate === "ready" && !!user,
      isLoading,
      authGate,
      permissionsSyncing,
      permissionsByType,
      rbacEnabled,
      isPlatformAdmin,
      hasPage,
      hasOperational,
      pagePermissions,
      operationalPermissions,
      can,
      isImpersonating,
      revertImpersonation,
      login,
      logout,
    }),
    [
      user,
      authGate,
      isLoading,
      permissionsSyncing,
      permissionsByType,
      rbacEnabled,
      isPlatformAdmin,
      hasPage,
      hasOperational,
      pagePermissions,
      operationalPermissions,
      can,
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
