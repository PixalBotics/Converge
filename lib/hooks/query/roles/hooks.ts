"use client";

import { useQuery } from "@tanstack/react-query";
import { listRoles } from "@/api";
import type { JsonRecord } from "@/api";
import { rolesKeys } from "./keys";

export function useRolesListQuery(params?: JsonRecord, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: rolesKeys.list(params),
    queryFn: () => listRoles(params),
    enabled: options?.enabled ?? true,
  });
}
