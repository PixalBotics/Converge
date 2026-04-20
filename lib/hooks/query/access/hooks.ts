"use client";

import { useQuery } from "@tanstack/react-query";
import { listPermissionsCatalog } from "@/api";
import { accessKeys } from "./keys";

export function usePermissionsCatalogQuery(options?: { enabled?: boolean; scope?: string }) {
  const scope = options?.scope ?? "default";
  return useQuery({
    queryKey: [...accessKeys.permissionsCatalog(), scope] as const,
    queryFn: () => listPermissionsCatalog(),
    enabled: options?.enabled ?? true,
  });
}

