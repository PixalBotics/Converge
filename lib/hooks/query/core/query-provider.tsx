"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { registerAppQueryCacheClear } from "./app-query-cache";
import { makeQueryClient } from "./query-client";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => makeQueryClient());

  useEffect(() => {
    registerAppQueryCacheClear(() => {
      client.clear();
    });
    return () => registerAppQueryCacheClear(null);
  }, [client]);

  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}
