"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enableDepartmentShift, listDepartmentShifts, removeDepartmentShift } from "@/api";
import type { JsonRecord } from "@/api";
import { hrmsDepartmentShiftsKeys } from "./keys";

export type HrmsDepartmentShiftsListParams = {
  departmentId?: string;
  page?: number;
  limit?: number;
  all?: boolean;
};

export function useDepartmentShiftsListQuery(
  params: HrmsDepartmentShiftsListParams | undefined,
  options?: { enabled?: boolean; scope?: string },
) {
  const scope = options?.scope ?? "default";
  const enabled = options?.enabled ?? true;
  const req = params as unknown as JsonRecord | undefined;
  return useQuery({
    queryKey: [...hrmsDepartmentShiftsKeys.list(req), scope] as const,
    queryFn: () => listDepartmentShifts(req),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useEnableDepartmentShiftMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: JsonRecord) => enableDepartmentShift(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: hrmsDepartmentShiftsKeys.all });
    },
  });
}

export function useRemoveDepartmentShiftMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeDepartmentShift(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: hrmsDepartmentShiftsKeys.all });
    },
  });
}
