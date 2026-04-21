"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assignPoolShift, listPoolShiftAssignments, removePoolShiftAssignment } from "@/api";
import type { JsonRecord } from "@/api";
import { hrmsPoolShiftAssignmentsKeys } from "./keys";

export type HrmsPoolShiftAssignmentsListParams = {
  poolId: string;
  page?: number;
  limit?: number;
  all?: boolean;
};

export function usePoolShiftAssignmentsListQuery(
  params: HrmsPoolShiftAssignmentsListParams | undefined,
  options?: { enabled?: boolean; scope?: string },
) {
  const scope = options?.scope ?? "default";
  const enabled = (options?.enabled ?? true) && Boolean(params?.poolId?.trim());
  const req = params as unknown as JsonRecord | undefined;
  return useQuery({
    queryKey: [...hrmsPoolShiftAssignmentsKeys.list(req), scope] as const,
    queryFn: () => listPoolShiftAssignments(req),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useAssignPoolShiftMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: JsonRecord) => assignPoolShift(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: hrmsPoolShiftAssignmentsKeys.all });
    },
  });
}

export function useRemovePoolShiftAssignmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removePoolShiftAssignment(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: hrmsPoolShiftAssignmentsKeys.all });
    },
  });
}

