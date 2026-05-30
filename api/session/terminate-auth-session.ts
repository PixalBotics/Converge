import axios from "axios";
import { getApiBaseUrl } from "../config";
import { joinUrl } from "../http/http-path";
import { clearTokens, getRefreshToken } from "../storage/auth-cookies";
import type { LogoutRequestBody } from "../types/auth.types";
import { AUTH_PATHS, isEmbedAppPath } from "@/lib/auth/auth-paths";
import { clearImpersonationSession } from "@/lib/auth/impersonation-session";
import { dismissAppBoundary } from "@/lib/app-boundaries";
import {
  getAuthSessionTeardown,
  type AuthSessionTeardownReason,
} from "./auth-session-teardown";
import { resetRefreshSessionFlight } from "./refresh-access-token";

let terminateInFlight: Promise<void> | null = null;
let sessionTerminated = false;

/** True while/after forced logout — suppress duplicate session modals from React Query. */
export function isAuthSessionTerminated(): boolean {
  return sessionTerminated;
}

export function resetAuthSessionTerminatedFlag(): void {
  sessionTerminated = false;
}

async function bestEffortRemoteLogout(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return;

  const baseURL = getApiBaseUrl();
  try {
    await axios.post<unknown>(
      joinUrl(baseURL, "/auth/logout"),
      { refreshToken } satisfies LogoutRequestBody,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 8_000,
      },
    );
  } catch {
    /* Server may already have revoked the refresh token. */
  }
}

/**
 * Enterprise-style session end: revoke refresh on server (best effort), wipe cookies,
 * reset client auth state, redirect to login. Safe to call from axios, sync, or AuthProvider.
 */
export function terminateAuthSession(
  reason: AuthSessionTeardownReason = "refresh_failed",
): Promise<void> {
  if (terminateInFlight) return terminateInFlight;

  if (
    typeof window !== "undefined" &&
    isEmbedAppPath(window.location.pathname)
  ) {
    return Promise.resolve();
  }

  terminateInFlight = (async () => {
    sessionTerminated = true;
    resetRefreshSessionFlight();
    dismissAppBoundary();

    await bestEffortRemoteLogout();

    clearImpersonationSession();
    clearTokens();

    const teardown = getAuthSessionTeardown();
    if (teardown) {
      await teardown({ reason });
      return;
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams({ session: "expired" });
      window.location.assign(`${AUTH_PATHS.login}?${params.toString()}`);
    }
  })().finally(() => {
    terminateInFlight = null;
  });

  return terminateInFlight;
}
