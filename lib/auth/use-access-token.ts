"use client";

import { useCallback, useEffect, useState } from "react";
import { getAccessToken } from "@/api";
import { ACCESS_TOKEN_CHANGED_EVENT } from "./access-token-events";

/**
 * Reactive access token for client components. Cookie writes do not trigger
 * re-renders unless listeners run (see `notifyAccessTokenChanged`).
 */
export function useAccessToken(): string | null {
  const read = useCallback(() => getAccessToken()?.trim() || null, []);
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== "undefined" ? read() : null,
  );

  useEffect(() => {
    const sync = () => setToken(read());
    sync();
    window.addEventListener(ACCESS_TOKEN_CHANGED_EVENT, sync);
    return () => window.removeEventListener(ACCESS_TOKEN_CHANGED_EVENT, sync);
  }, [read]);

  return token;
}
