import axios from "axios";
import { getApiBaseUrl } from "../config";
import { joinUrl } from "../http/http-path";
import { getRefreshToken, setTokenPair } from "../storage/auth-cookies";
import type { ApiEnvelope, AuthTokenPair } from "../types/auth.types";

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
  data: AuthTokenPair | ApiEnvelope<AuthTokenPair>,
): AuthTokenPair {
  if (typeof data === "object" && data !== null && "success" in data) {
    const envelope = data as ApiEnvelope<AuthTokenPair>;
    if (envelope.success === false) {
      throw new Error(envelope.message?.trim() || "Refresh token rejected");
    }
  }

  const tokenPair =
    typeof data === "object" && data !== null && "data" in data
      ? (data as ApiEnvelope<AuthTokenPair>).data
      : (data as AuthTokenPair);

  if (!tokenPair?.accessToken?.trim() || !tokenPair?.refreshToken?.trim()) {
    throw new Error("Invalid refresh response payload");
  }

  return {
    accessToken: tokenPair.accessToken.trim(),
    refreshToken: tokenPair.refreshToken.trim(),
  };
}

async function postRefreshOnce(refreshToken: string): Promise<AuthTokenPair> {
  const baseURL = getApiBaseUrl();
  const { data } = await axios.post<AuthTokenPair | ApiEnvelope<AuthTokenPair>>(
    joinUrl(baseURL, "/auth/refresh"),
    { refreshToken },
    {
      headers: { "Content-Type": "application/json" },
      timeout: 15_000,
    },
  );
  const tokenPair = parseRefreshTokenPair(data);
  setTokenPair(tokenPair);
  return tokenPair;
}

async function refreshWithStoredToken(): Promise<AuthTokenPair> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("Missing refresh token");
  }
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
 * Calls POST /auth/refresh with the refresh cookie, persists the new pair, returns tokens.
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
