import axios from "axios";
import { getApiBaseUrl } from "../config";
import { joinUrl } from "../http/http-path";
import { getRefreshToken, setTokenPair } from "../storage/auth-cookies";
import type { ApiEnvelope, AuthTokenPair } from "../types/auth.types";

let refreshInFlight: Promise<AuthTokenPair> | null = null;

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
        { headers: { "Content-Type": "application/json" } },
      );
      const tokenPair = "data" in data ? data.data : data;
      if (!tokenPair?.accessToken || !tokenPair?.refreshToken) {
        throw new Error("Invalid refresh response payload");
      }
      setTokenPair(tokenPair);
      return tokenPair;
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}
