"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  decideLeaveDepartment,
  decideLeavePool,
  getLeaveQuotaSummary,
  getMyLeaveApplications,
  getPendingLeaveDepartmentQueue,
  getPendingLeavePoolQueue,
  submitLeaveApplication,
} from "@/api";
import type { JsonRecord } from "@/api";
import { hrmsLeaveApplicationsKeys } from "./keys";

export type HrmsLeaveApplicationsListParams = {
  page?: number;
  limit?: number;
  all?: boolean;
  search?: string;
};

export function useMyLeaveApplicationsQuery(params: HrmsLeaveApplicationsListParams | undefined, options?: { enabled?: boolean; scope?: string }) {
  const scope = options?.scope ?? "default";
  const enabled = options?.enabled ?? true;
  const req = params as unknown as JsonRecord | undefined;
  return useQuery({
    queryKey: [...hrmsLeaveApplicationsKeys.me(req), scope] as const,
    queryFn: () => getMyLeaveApplications(req),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useLeaveQuotaSummaryQuery(
  params: { year?: number } | undefined,
  options?: { enabled?: boolean; scope?: string },
) {
  const scope = options?.scope ?? "default";
  const enabled = options?.enabled ?? true;
  const req = params as unknown as JsonRecord | undefined;
  return useQuery({
    queryKey: [...hrmsLeaveApplicationsKeys.quotaSummary(req), scope] as const,
    queryFn: () => getLeaveQuotaSummary(req),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function usePendingLeavePoolQueueQuery(params: HrmsLeaveApplicationsListParams | undefined, options?: { enabled?: boolean; scope?: string }) {
  const scope = options?.scope ?? "default";
  const enabled = options?.enabled ?? true;
  const req = params as unknown as JsonRecord | undefined;
  return useQuery({
    queryKey: [...hrmsLeaveApplicationsKeys.pendingPoolQueue(req), scope] as const,
    queryFn: () => getPendingLeavePoolQueue(req),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function usePendingLeaveDepartmentQueueQuery(
  params: HrmsLeaveApplicationsListParams | undefined,
  options?: { enabled?: boolean; scope?: string },
) {
  const scope = options?.scope ?? "default";
  const enabled = options?.enabled ?? true;
  const req = params as unknown as JsonRecord | undefined;
  return useQuery({
    queryKey: [...hrmsLeaveApplicationsKeys.pendingDepartmentQueue(req), scope] as const,
    queryFn: () => getPendingLeaveDepartmentQueue(req),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useSubmitLeaveApplicationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: JsonRecord) => submitLeaveApplication(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: hrmsLeaveApplicationsKeys.all });
    },
  });
}

export function useDecideLeavePoolMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; body: JsonRecord }) => decideLeavePool(vars.id, vars.body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: hrmsLeaveApplicationsKeys.all });
    },
  });
}

export function useDecideLeaveDepartmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; body: JsonRecord }) => decideLeaveDepartment(vars.id, vars.body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: hrmsLeaveApplicationsKeys.all });
    },
  });
}

