"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { getUserAttendance } from "@/api";
import { hrmsAttendanceKeys } from "@/lib/hooks/query/hrms/attendance/keys";
import { extractAttendanceItems } from "./attendance-rows";

export function useHeadRosterDayAttendanceQueries(
  userIds: readonly string[],
  date: string,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? true;
  const day = date.trim();

  const queries = useQueries({
    queries: userIds.map((userId) => ({
      queryKey: [...hrmsAttendanceKeys.user(userId, { from: day, to: day, all: true }), "roster-day"] as const,
      queryFn: () => getUserAttendance(userId, { from: day, to: day, all: true }),
      enabled: enabled && day.length > 0 && userId.trim().length > 0,
    })),
  });

  const items = useMemo(() => {
    const merged: Record<string, unknown>[] = [];
    for (const query of queries) {
      merged.push(...extractAttendanceItems(query.data));
    }
    return merged;
  }, [queries]);

  const isLoading = queries.some((q) => q.isLoading || q.isFetching);
  const isError = queries.some((q) => q.isError);

  return { items, isLoading, isError, queries };
}
