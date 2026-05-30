import { decodeJwtExpMs } from "@/lib/widget-runtime/jwt-expiry";

type JwtPayloadShape = {
  tokenType?: unknown;
  exp?: unknown;
};

function decodeJwtPayload(token: string): JwtPayloadShape | null {
  const trimmed = token.trim();
  if (!trimmed) return null;
  const segments = trimmed.split(".");
  if (segments.length < 2 || typeof segments[1] !== "string") return null;
  try {
    if (typeof atob === "undefined") return null;
    const b64 = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    return JSON.parse(atob(b64 + pad)) as JwtPayloadShape;
  } catch {
    return null;
  }
}

/** True only for dashboard login JWT (`tokenType: access`). */
export function isDashboardAccessToken(token: string | null | undefined): boolean {
  if (!token?.trim()) return false;
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  const tt = typeof payload.tokenType === "string" ? payload.tokenType : "";
  return tt === "access";
}

export function isAccessTokenExpiringSoon(
  token: string | null | undefined,
  skewMs = 120_000,
): boolean {
  const expMs = decodeJwtExpMs(token);
  if (!expMs) return false;
  return expMs - Date.now() <= skewMs;
}
