import axios from "axios";
import { getApiBaseUrl } from "../config";
import { joinUrl } from "../http/http-path";
import { getRefreshToken, setTokenPair } from "../storage/auth-cookies";
import type { ApiEnvelope, AuthTokenPair, LoginSuccessData } from "../types/auth.types";
import {
  releaseCrossTabRefreshLock,
  tryAcquireCrossTabRefreshLock,
  waitForCrossTabTokenUpdate,
} from "@/lib/auth/token-cross-tab-sync";

let refreshInFlight: Promise<AuthTokenPair> | null = null;

type Queued401 = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let unauthorizedQueue: Queued401[] = [];

export function resetRefreshSessionFlight(): void {
  refreshInFlight = null;
  unauthorizedQueue = [];
}

/** Await while a token refresh triggered by a 401 is in progress. */
export function waitForSessionRefresh(): Promise<void> {
  if (!refreshInFlight) return Promise.resolve();
  return refreshInFlight.then(() => undefined).catch(() => undefined);
}

function parseRefreshTokenPair(
  data: AuthTokenPair | ApiEnvelope<AuthTokenPair | LoginSuccessData>,
): AuthTokenPair {
  if (typeof data === "object" && data !== null && "success" in data) {
    const envelope = data as ApiEnvelope<AuthTokenPair | LoginSuccessData>;
    if (envelope.success === false) {
      throw new Error(envelope.message?.trim() || "Refresh token rejected");
    }
  }

  const root =
    typeof data === "object" && data !== null && "data" in data
      ? (data as ApiEnvelope<AuthTokenPair | LoginSuccessData>).data
      : (data as AuthTokenPair | LoginSuccessData);

  const tokenPair =
    root && typeof root === "object" && "accessToken" in root
      ? {
          accessToken: String(root.accessToken ?? "").trim(),
          refreshToken: String(root.refreshToken ?? "").trim(),
        }
      : null;

  if (!tokenPair?.accessToken || !tokenPair.refreshToken) {
    throw new Error("Invalid refresh response payload");
  }

  return tokenPair;
}

function refreshCookieHints(
  data: AuthTokenPair | ApiEnvelope<AuthTokenPair | LoginSuccessData>,
): { accessExpiresIn?: string; refreshExpiresIn?: string } | undefined {
  const root =
    typeof data === "object" && data !== null && "data" in data
      ? (data as ApiEnvelope<LoginSuccessData>).data
      : (data as LoginSuccessData);
  if (!root || typeof root !== "object") return undefined;
  const accessExpiresIn =
    "expiresIn" in root && typeof root.expiresIn === "string" ? root.expiresIn : undefined;
  const refreshExpiresIn =
    "refreshExpiresIn" in root && typeof root.refreshExpiresIn === "string"
      ? root.refreshExpiresIn
      : undefined;
  if (!accessExpiresIn && !refreshExpiresIn) return undefined;
  return { accessExpiresIn, refreshExpiresIn };
}

async function postRefreshOnce(refreshToken: string): Promise<AuthTokenPair> {
  const baseURL = getApiBaseUrl();
  const { data } = await axios.post<
    AuthTokenPair | ApiEnvelope<AuthTokenPair | LoginSuccessData>
  >(
    joinUrl(baseURL, "/auth/refresh"),
    { refreshToken },
    {
      headers: { "Content-Type": "application/json" },
      timeout: 15_000,
    },
  );
  const tokenPair = parseRefreshTokenPair(data);
  setTokenPair(tokenPair, refreshCookieHints(data));
  return tokenPair;
}

async function refreshWithStoredToken(): Promise<AuthTokenPair> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("Missing refresh token");
  }

  const ownsLock = tryAcquireCrossTabRefreshLock();
  if (!ownsLock) {
    const synced = await waitForCrossTabTokenUpdate();
    if (synced?.accessToken && synced.refreshToken) {
      const pair = {
        accessToken: synced.accessToken,
        refreshToken: synced.refreshToken,
      };
      setTokenPair(pair, {
        accessExpiresIn: synced.accessExpiresIn,
        refreshExpiresIn: synced.refreshExpiresIn,
      });
      return pair;
    }
  }

  try {
    try {
      return await postRefreshOnce(refreshToken);
    } catch (first) {
      await new Promise((r) => setTimeout(r, 200));
      const retryToken = getRefreshToken();
      if (!retryToken || retryToken === refreshToken) {
        throw first;
      }
      return postRefreshOnce(retryToken);
    }
  } finally {
    if (ownsLock) releaseCrossTabRefreshLock();
  }
}

function flushUnauthorizedQueue(error: unknown | null, accessToken: string | null): void {
  const pending = unauthorizedQueue;
  unauthorizedQueue = [];
  for (const item of pending) {
    if (error || !accessToken) {
      item.reject(error ?? new Error("Session refresh failed"));
    } else {
      item.resolve(accessToken);
    }
  }
}

/**
 * Calls POST /auth/refresh with the refresh token, persists the new pair, returns tokens.
 * Uses raw axios so interceptors cannot recurse. Concurrent callers share one flight.
 */
export function refreshSessionWithStoredRefresh(): Promise<AuthTokenPair> {
  if (!refreshInFlight) {
    refreshInFlight = refreshWithStoredToken()
      .then((tokens) => {
        flushUnauthorizedQueue(null, tokens.accessToken);
        return tokens;
      })
      .catch((error) => {
        flushUnauthorizedQueue(error, null);
        throw error;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

/**
 * Queue a 401 retry until the in-flight refresh completes (avoids refresh-token rotation races).
 */
export function queueRequestUntilRefreshed(): Promise<string> {
  if (refreshInFlight) {
    return new Promise<string>((resolve, reject) => {
      unauthorizedQueue.push({ resolve, reject });
    });
  }
  return refreshSessionWithStoredRefresh().then((t) => t.accessToken);
}
