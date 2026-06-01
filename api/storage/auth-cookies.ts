import {
  ACCESS_TOKEN_COOKIE_MAX_AGE_SEC,
  REFRESH_TOKEN_COOKIE_MAX_AGE_SEC,
} from "../config";
import type { AuthTokenPair } from "../types/auth.types";
import {
  AUTH_COOKIE_ACCESS,
  AUTH_COOKIE_REFRESH,
} from "@/lib/auth/auth-cookie-names";
import { resolveTokenCookieMaxAgeSec } from "@/lib/auth/token-cookie-max-age";
import { broadcastTokenPairUpdate } from "@/lib/auth/token-cross-tab-sync";

export type TokenCookieHints = {
  accessExpiresIn?: string | null;
  refreshExpiresIn?: string | null;
};

function isBrowser(): boolean {
  return typeof document !== "undefined";
}

function cookieFlags(maxAgeSec: number): string {
  const secure =
    typeof location !== "undefined" && location.protocol === "https:";
  const base = `Path=/; SameSite=Lax; Max-Age=${maxAgeSec}`;
  return secure ? `${base}; Secure` : base;
}

function readCookieRaw(name: string): string | null {
  if (!isBrowser()) return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${escaped}=([^;]*)`),
  );
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

function writeCookieRaw(name: string, value: string, maxAgeSec: number): void {
  if (!isBrowser()) return;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; ${cookieFlags(maxAgeSec)}`;
}

function eraseCookieRaw(name: string): void {
  if (!isBrowser()) return;
  const secure =
    typeof location !== "undefined" && location.protocol === "https:";
  const base = `Path=/; SameSite=Lax; Max-Age=0`;
  document.cookie = `${encodeURIComponent(name)}=; ${secure ? `${base}; Secure` : base}`;
}

export function getAccessToken(): string | null {
  return readCookieRaw(AUTH_COOKIE_ACCESS);
}

export function getRefreshToken(): string | null {
  return readCookieRaw(AUTH_COOKIE_REFRESH);
}

export function getTokenPair(): AuthTokenPair | null {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export function setTokenPair(tokens: AuthTokenPair, hints?: TokenCookieHints): void {
  const accessMax = resolveTokenCookieMaxAgeSec(
    tokens.accessToken,
    hints?.accessExpiresIn,
    ACCESS_TOKEN_COOKIE_MAX_AGE_SEC,
  );
  const refreshMax = resolveTokenCookieMaxAgeSec(
    tokens.refreshToken,
    hints?.refreshExpiresIn,
    REFRESH_TOKEN_COOKIE_MAX_AGE_SEC,
  );

  writeCookieRaw(AUTH_COOKIE_ACCESS, tokens.accessToken, accessMax);
  writeCookieRaw(AUTH_COOKIE_REFRESH, tokens.refreshToken, refreshMax);

  broadcastTokenPairUpdate({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessExpiresIn: hints?.accessExpiresIn,
    refreshExpiresIn: hints?.refreshExpiresIn,
    at: Date.now(),
  });
}

export function setAccessToken(accessToken: string, accessExpiresIn?: string | null): void {
  writeCookieRaw(
    AUTH_COOKIE_ACCESS,
    accessToken,
    resolveTokenCookieMaxAgeSec(
      accessToken,
      accessExpiresIn,
      ACCESS_TOKEN_COOKIE_MAX_AGE_SEC,
    ),
  );
}

export function clearTokens(): void {
  eraseCookieRaw(AUTH_COOKIE_ACCESS);
  eraseCookieRaw(AUTH_COOKIE_REFRESH);
}
