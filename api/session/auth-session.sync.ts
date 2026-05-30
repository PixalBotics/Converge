import { isAxiosError } from "axios";
import { getAccessToken, getRefreshToken } from "../storage/auth-cookies";
import type { AuthSessionSyncResult } from "../types/auth.types";
import { verifyBearer } from "../auth/auth.api";
import { refreshSessionWithStoredRefresh } from "./refresh-access-token";
import { terminateAuthSession } from "./terminate-auth-session";

function isUnauthorized(err: unknown): boolean {
  return isAxiosError(err) && err.response?.status === 401;
}

function isNetworkFailure(err: unknown): boolean {
  if (isAxiosError(err)) {
    if (!err.response) {
      const code = err.code?.toUpperCase() ?? "";
      return code !== "ERR_CANCELED";
    }
  }
  return false;
}

/**
 * Validates the current session with the server and refreshes tokens when needed.
 * Intended for: full page reload, bfcache restore, tab focus — call from your root
 * client shell when you wire auth (not invoked by the app yet).
 */
export async function synchronizeAuthSession(): Promise<AuthSessionSyncResult> {
  const access = getAccessToken();
  const refresh = getRefreshToken();

  if (!access && !refresh) {
    return { status: "anonymous" };
  }

  let rotated = false;
  if (!access && refresh) {
    try {
      await refreshSessionWithStoredRefresh();
      rotated = true;
    } catch {
      try {
        await refreshSessionWithStoredRefresh();
        rotated = true;
      } catch {
        await terminateAuthSession("refresh_failed");
        return { status: "invalid" };
      }
    }
  }

  try {
    await verifyBearer();
    return { status: rotated ? "refreshed" : "valid" };
  } catch (err: unknown) {
    if (!isUnauthorized(err)) {
      if (isNetworkFailure(err)) {
        return { status: "unreachable", error: err };
      }
      return { status: "error", error: err };
    }
    try {
      await refreshSessionWithStoredRefresh();
      await verifyBearer();
      return { status: "refreshed" };
    } catch {
      try {
        await new Promise((r) => setTimeout(r, 200));
        await refreshSessionWithStoredRefresh();
        await verifyBearer();
        return { status: "refreshed" };
      } catch {
        await terminateAuthSession("verify_failed");
        return { status: "invalid" };
      }
    }
  }
}

/**
 * Registers lightweight listeners so verify (+ refresh if needed) runs after
 * navigation restore and when the tab gains focus. Returns an unsubscribe
 * function. Safe to call once from a client `AuthProvider` later.
 */
export function attachAuthSessionLifecycleListeners(): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  let debounce: ReturnType<typeof setTimeout> | null = null;

  const schedule = () => {
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(() => {
      debounce = null;
      void synchronizeAuthSession();
    }, 250);
  };

  window.addEventListener("pageshow", schedule);
  window.addEventListener("focus", schedule);

  return () => {
    window.removeEventListener("pageshow", schedule);
    window.removeEventListener("focus", schedule);
    if (debounce) clearTimeout(debounce);
  };
}
