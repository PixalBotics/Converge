"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWebsiteAssignmentDetailQuery } from "@/lib/hooks";
import { parseWebsiteAssignmentDetail } from "@/lib/website-assignments/roster-payload";
import { fetchMonitorDirectoryAgents } from "@/services/chat/monitor.api";
import {
  filterChatWebsiteAgentRows,
  flattenAgentsFromWebsiteDetail,
  mergeMonitorAgentRows,
  type ChatWebsiteAgentRow,
} from "../utils/flatten-website-agents";

export function useChatWebsiteAgents(
  websiteId: string,
  parentCompanyId: string,
  filters: {
    departmentId?: string;
    poolId?: string;
    search?: string;
  },
  options: { enabled: boolean; useMonitorDirectory?: boolean },
) {
  const wid = websiteId.trim();
  const pcId = parentCompanyId.trim();

  const detailQuery = useWebsiteAssignmentDetailQuery(wid, {
    enabled: options.enabled && Boolean(wid),
  });

  const monitorQuery = useQuery({
    queryKey: [
      "chat-website-agents-monitor",
      wid,
      pcId,
      filters.departmentId,
      filters.poolId,
    ] as const,
    queryFn: () =>
      fetchMonitorDirectoryAgents({
        parentCompanyId: pcId || undefined,
        websiteId: wid,
        departmentId: filters.departmentId?.trim() || undefined,
        poolId: filters.poolId?.trim() || undefined,
      }),
    enabled: options.enabled && options.useMonitorDirectory !== false && Boolean(wid),
    staleTime: 20_000,
  });

  const baseRows = useMemo((): ChatWebsiteAgentRow[] => {
    const monitorRoster = monitorQuery.data?.roster ?? [];
    if (monitorRoster.length > 0) {
      return mergeMonitorAgentRows(monitorRoster, wid);
    }
    return flattenAgentsFromWebsiteDetail(
      parseWebsiteAssignmentDetail(detailQuery.data),
    );
  }, [detailQuery.data, monitorQuery.data?.roster, wid]);

  const rows = useMemo(
    () =>
      filterChatWebsiteAgentRows(baseRows, {
        departmentId: filters.departmentId,
        search: filters.search,
      }),
    [baseRows, filters.departmentId, filters.search],
  );

  return {
    rows,
    isLoading: detailQuery.isLoading || monitorQuery.isLoading,
    isError: detailQuery.isError && monitorQuery.isError,
    detail: parseWebsiteAssignmentDetail(detailQuery.data),
  };
}
