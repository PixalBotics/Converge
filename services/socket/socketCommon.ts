import type { ManagerOptions, SocketOptions } from "socket.io-client";

export type StableSocketOptions = Partial<ManagerOptions & SocketOptions>;

export interface SocketEndpoint {
  baseUrl: string;
  namespace: string;
}

export function normalizeSocketNamespace(namespace: string): string {
  if (!namespace) return "/";
  return namespace.startsWith("/") ? namespace : `/${namespace}`;
}

export function resolveSocketEndpoint(params: {
  envBaseUrl?: string;
  envFallbackBaseUrl?: string;
  envNamespace?: string;
  defaultNamespace: string;
}): SocketEndpoint {
  const rawBase = params.envBaseUrl || params.envFallbackBaseUrl || "";
  const baseUrl = rawBase.replace(/\/+$/, "");
  const namespace = normalizeSocketNamespace(
    params.envNamespace || params.defaultNamespace,
  );

  if (!baseUrl) {
    throw new Error(
      "Socket base URL is missing. Set NEXT_PUBLIC_CHAT_SOCKET_BASE_URL in .env.local.",
    );
  }

  return { baseUrl, namespace };
}

export function buildSocketUrl(endpoint: SocketEndpoint): string {
  return `${endpoint.baseUrl}${endpoint.namespace}`;
}

export function getStableSocketDefaults(): StableSocketOptions {
  return {
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5,
    timeout: 20000,
  };
}
