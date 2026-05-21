"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAccessToken } from "@/api";
import { fetchChatReportOverview } from "@/services/chat/reports.api";
import type { ChatReportQuery } from "@/services/chat/reports.types";
import { defaultReportRange } from "../utils/format-metric";
import { chatReportKeys } from "./keys";

export function useChatReports() {
  const token = getAccessToken() ?? "";
  const [range, setRange] = useState(defaultReportRange);
  const [websiteId, setWebsiteId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");

  const query = useMemo((): ChatReportQuery => {
    const q: ChatReportQuery = { ...range };
    if (websiteId.trim()) q.websiteId = websiteId.trim();
    if (departmentId.trim()) q.departmentId = departmentId.trim();
    return q;
  }, [range, websiteId, departmentId]);

  const overviewQuery = useQuery({
    queryKey: chatReportKeys.overview(query),
    queryFn: () => fetchChatReportOverview(query, token),
    enabled: Boolean(token),
  });

  return {
    token,
    range,
    setRange,
    websiteId,
    setWebsiteId,
    departmentId,
    setDepartmentId,
    overview: overviewQuery.data ?? null,
    loading: overviewQuery.isLoading,
    error: overviewQuery.error,
    refresh: () => void overviewQuery.refetch(),
  };
}
