"use client";

import { useQuery } from "@tanstack/react-query";
import { listDepartments } from "@/api";
import type { JsonRecord } from "@/api";
import { hrmsDepartmentsKeys } from "./keys";

export function useDepartmentsListQuery(
  params?: JsonRecord,
  options?: { enabled?: boolean; /** Extra cache segment (not sent to API). */ scope?: string },
) {
  const scope = options?.scope ?? "default";
  return useQuery({
    queryKey: [...hrmsDepartmentsKeys.list(params), scope] as const,
    queryFn: () => listDepartments(params),
    enabled: options?.enabled ?? true,
  });
}
