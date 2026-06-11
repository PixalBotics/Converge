"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  attendanceBreakIn,
  attendanceBreakOut,
  attendanceCheckIn,
  attendanceCheckOut,
  getMyAttendance,
  getUserAttendance,
} from "@/api";
import type { JsonRecord } from "@/api";
import { hrmsAttendanceKeys } from "./keys";

export type HrmsAttendanceRangeParams = {
  from: string;
  to: string;
  page?: number;
  limit?: number;
  all?: boolean;
};

export function useAttendanceMeQuery(
  params: HrmsAttendanceRangeParams | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: hrmsAttendanceKeys.me(params as unknown as JsonRecord | undefined),
    queryFn: () => getMyAttendance(params as unknown as JsonRecord | undefined),
    enabled: options?.enabled ?? true,
  });
}

export function useAttendanceUserQuery(
  userId: string | undefined,
  params: HrmsAttendanceRangeParams | undefined,
  options?: { enabled?: boolean },
) {
  const id = userId?.trim() ?? "";
  return useQuery({
    queryKey: hrmsAttendanceKeys.user(id, params as unknown as JsonRecord | undefined),
    queryFn: () => getUserAttendance(id, params as unknown as JsonRecord | undefined),
    enabled: (options?.enabled ?? true) && id.length > 0,
  });
}

export function useAttendanceCheckInMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: JsonRecord) => attendanceCheckIn(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: hrmsAttendanceKeys.all });
    },
  });
}

export function useAttendanceCheckOutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: JsonRecord) => attendanceCheckOut(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: hrmsAttendanceKeys.all });
    },
  });
}

export function useAttendanceBreakInMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: JsonRecord) => attendanceBreakIn(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: hrmsAttendanceKeys.all });
    },
  });
}

export function useAttendanceBreakOutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: JsonRecord) => attendanceBreakOut(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: hrmsAttendanceKeys.all });
    },
  });
}

