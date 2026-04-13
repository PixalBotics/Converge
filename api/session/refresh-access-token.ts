import axios from "axios";
import { getApiBaseUrl } from "../config";
import { joinUrl } from "../http/http-path";
import { getRefreshToken, setTokenPair } from "../storage/auth-cookies";
import type { AuthTokenPair } from "../types/auth.types";

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
      const { data } = await axios.post<AuthTokenPair>(
        joinUrl(baseURL, "/auth/refresh"),
        { refreshToken },
        { headers: { "Content-Type": "application/json" } },
      );
      setTokenPair(data);
      return data;
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}
