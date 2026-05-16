"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createShiftTemplate, deleteShiftTemplate, getShiftTemplate, listShiftTemplates, updateShiftTemplate } from "@/api";
import type { JsonRecord } from "@/api";
import { buildHrmsShiftsListQueryRecord, type HrmsShiftsListQueryInput } from "@/lib/utils/hrms";
import { hrmsShiftsKeys } from "./keys";

/**
 * `GET /hrms/shifts` — camelCase query: `page`, `limit`, `all`, `parentCompanyId`, `search`, `shiftScope`.
 * `shiftScope`: `internal` | `external` | `all` — server-side catalog slice; JWT resolves allowed rows.
 */
export type HrmsShiftsListParams = HrmsShiftsListQueryInput;

export function useShiftsListQuery(params: HrmsShiftsListParams | undefined, options?: { enabled?: boolean; scope?: string }) {
  const scope = options?.scope ?? "default";
  const enabled = options?.enabled ?? true;
  const req = buildHrmsShiftsListQueryRecord(params) as JsonRecord | undefined;
  return useQuery({
    queryKey: [...hrmsShiftsKeys.list(req), scope] as const,
    queryFn: () => listShiftTemplates(req),
    enabled,
    placeholderData: keepPreviousData,
  });
}
export function useShiftQuery(id: string | undefined, options?: { enabled?: boolean; scope?: string }) {
  const trimmed = id?.trim() ?? "";
  const scope = options?.scope ?? "default";
  const enabled = (options?.enabled ?? true) && trimmed.length > 0;
  return useQuery({
    queryKey: [...hrmsShiftsKeys.detail(trimmed), scope] as const,
    queryFn: () => getShiftTemplate(trimmed),
    enabled,
  });
}

export function useCreateShiftMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: JsonRecord) => createShiftTemplate(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: hrmsShiftsKeys.all });
    },
  });
}

export function useUpdateShiftMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; body: JsonRecord }) => updateShiftTemplate(vars.id, vars.body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: hrmsShiftsKeys.all });
    },
  });
}

export function useDeleteShiftMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteShiftTemplate(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: hrmsShiftsKeys.all });
    },
  });
}

