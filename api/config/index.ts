function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!raw) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set. Add it to .env.local (see .env.example).",
    );
  }
  return normalizeBaseUrl(raw);
}

/** Cookie Max-Age (seconds). Align with JWT TTL from your issuer when known. */
export const ACCESS_TOKEN_COOKIE_MAX_AGE_SEC = 60 * 60; // 1h fallback
export const REFRESH_TOKEN_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 14; // 14d
