"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assignPoolHead, listPoolHeads, listPoolHeadsAttendance, removePoolHead } from "@/api";
import type { JsonRecord } from "@/api";
import { hrmsPoolHeadsKeys } from "./keys";

export type HrmsPoolHeadsListParams = {
  poolId?: string;
  page?: number;
  limit?: number;
  all?: boolean;
};

export type HrmsPoolHeadsAttendanceParams = {
  poolId?: string;
  memberName?: string;
  date?: string;
  page?: number;
  limit?: number;
  all?: boolean;
};

export function usePoolHeadsListQuery(
  params: HrmsPoolHeadsListParams | undefined,
  options?: { enabled?: boolean; scope?: string },
) {
  const enabled = options?.enabled ?? true;
  const scope = options?.scope ?? "default";
  const req = params as unknown as JsonRecord | undefined;
  return useQuery({
    queryKey: [...hrmsPoolHeadsKeys.list(req), scope] as const,
    queryFn: () => listPoolHeads(req),
    enabled: enabled && params != null,
    placeholderData: keepPreviousData,
  });
}

export function usePoolHeadsAttendanceQuery(
  params: HrmsPoolHeadsAttendanceParams | undefined,
  options?: { enabled?: boolean; scope?: string },
) {
  const enabled = options?.enabled ?? true;
  const scope = options?.scope ?? "default";
  const req = params as unknown as JsonRecord | undefined;
  return useQuery({
    queryKey: [...hrmsPoolHeadsKeys.attendance(req), scope] as const,
    queryFn: () => listPoolHeadsAttendance(req),
    enabled: enabled && params != null,
    placeholderData: keepPreviousData,
  });
}

export function useAssignPoolHeadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: JsonRecord) => assignPoolHead(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: hrmsPoolHeadsKeys.all });
    },
  });
}

export function useRemovePoolHeadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removePoolHead(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: hrmsPoolHeadsKeys.all });
    },
  });
}

