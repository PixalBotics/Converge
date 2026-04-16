import {
  ACCESS_TOKEN_COOKIE_MAX_AGE_SEC,
  REFRESH_TOKEN_COOKIE_MAX_AGE_SEC,
} from "../config";
import type { AuthTokenPair } from "../types/auth.types";

const ACCESS_NAME = "converge_access_token";
const REFRESH_NAME = "converge_refresh_token";

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
  return readCookieRaw(ACCESS_NAME);
}

export function getRefreshToken(): string | null {
  return readCookieRaw(REFRESH_NAME);
}

export function getTokenPair(): AuthTokenPair | null {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export function setTokenPair(tokens: AuthTokenPair): void {
  writeCookieRaw(ACCESS_NAME, tokens.accessToken, ACCESS_TOKEN_COOKIE_MAX_AGE_SEC);
  writeCookieRaw(
    REFRESH_NAME,
    tokens.refreshToken,
    REFRESH_TOKEN_COOKIE_MAX_AGE_SEC,
  );
}

export function setAccessToken(accessToken: string): void {
  writeCookieRaw(ACCESS_NAME, accessToken, ACCESS_TOKEN_COOKIE_MAX_AGE_SEC);
}

export function clearTokens(): void {
  eraseCookieRaw(ACCESS_NAME);
  eraseCookieRaw(REFRESH_NAME);
}
