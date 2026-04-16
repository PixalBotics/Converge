"use client";

import { useQuery } from "@tanstack/react-query";
import { listDesignations } from "@/api";
import type { JsonRecord } from "@/api";
import { hrmsDesignationsKeys } from "./keys";

export function useDesignationsListQuery(
  params?: JsonRecord,
  options?: { enabled?: boolean; scope?: string },
) {
  const scope = options?.scope ?? "default";
  return useQuery({
    queryKey: [...hrmsDesignationsKeys.list(params), scope] as const,
    queryFn: () => listDesignations(params),
    enabled: options?.enabled ?? true,
  });
}
