import axios from "axios";
import { getApiBaseUrl } from "../config";
import { joinUrl } from "../http/http-path";
import { getRefreshToken, setTokenPair } from "../storage/auth-cookies";
import type { ApiEnvelope, AuthTokenPair } from "../types/auth.types";

let refreshInFlight: Promise<AuthTokenPair> | null = null;

export function resetRefreshSessionFlight(): void {
  refreshInFlight = null;
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

/**
 * Calls POST /auth/refresh with the refresh cookie, persists the new pair, returns tokens.
 * Uses raw axios so interceptors cannot recurse.
 */
export function refreshSessionWithStoredRefresh(): Promise<AuthTokenPair> {
  if (!refreshInFlight) {
    const baseURL = getApiBaseUrl();
    refreshInFlight = (async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error("Missing refresh token");
      }
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
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}
