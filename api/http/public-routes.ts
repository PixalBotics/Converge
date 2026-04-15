import type { InternalAxiosRequestConfig } from "axios";
import { pathFromConfig } from "./http-path";

/**
 * Routes that must not send Bearer and must not trigger refresh-retry logic
 * (except refresh itself, which clears session on failure).
 */
export function isPublicAuthRoute(config: InternalAxiosRequestConfig): boolean {
  const method = (config.method ?? "get").toLowerCase();
  const path = pathFromConfig(config);

  if (method === "get" && (path === "/health" || path.endsWith("/health"))) {
    return true;
  }
  if (method === "post" && path.endsWith("/auth/login")) return true;
  if (method === "post" && path.endsWith("/auth/refresh")) return true;
  if (method === "post" && path.endsWith("/auth/logout")) return true;
  if (method === "post" && path.endsWith("/auth/verify-access")) return true;

  return false;
}
