"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAccessToken } from "@/api";
import { chatMonitorKeys } from "@/features/chat-monitor/hooks/keys";
import { useChatReports } from "@/features/chat-reports/hooks/useChatReports";
import {
  fetchMonitorCapabilities,
  fetchMonitorDirectoryAgents,
  fetchMonitorLive,
} from "@/services/chat/monitor.api";
import type { MonitorDirectoryAgentRow } from "@/services/chat/monitor.types";
import { useChatApiGates } from "@/lib/permissions";
import { reportRangeForLabel } from "./dashboard-chat.utils";

export function useDashboardChatReports(dateRangeLabel: string) {
  const gates = useChatApiGates();
  const reports = useChatReports({ apiEnabled: gates.reports });

  useEffect(() => {
    if (!gates.reports) return;
    reports.setRange(reportRangeForLabel(dateRangeLabel));
  }, [dateRangeLabel, gates.reports, reports.setRange]);

  return {
    ...reports,
    enabled: gates.reports,
  };
}

export function agentDirectoryStatus(row: MonitorDirectoryAgentRow): {
  status: string;
  statusColor: string;
} {
  if (row.liveCount > 0) return { status: "Online", statusColor: "#22C55E" };
  if (row.waitingCount > 0) return { status: "Busy", statusColor: "#F97316" };
  return { status: "Offline", statusColor: "#EF4444" };
}

export function useDashboardMonitorSnapshot() {
  const gates = useChatApiGates();
  const token = getAccessToken() ?? "";
  const enabled = gates.monitor && Boolean(token);

  const capabilitiesQuery = useQuery({
    queryKey: chatMonitorKeys.capabilities(),
    queryFn: fetchMonitorCapabilities,
    enabled,
  });

  const capabilitiesReady = enabled && capabilitiesQuery.isSuccess && !capabilitiesQuery.isError;

  const liveQuery = useQuery({
    queryKey: chatMonitorKeys.live({}),
    queryFn: () => fetchMonitorLive({}),
    enabled: capabilitiesReady,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const agentsQuery = useQuery({
    queryKey: chatMonitorKeys.directoryAgents({}),
    queryFn: () => fetchMonitorDirectoryAgents({}),
    enabled: capabilitiesReady,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const liveList = liveQuery.data ?? [];
  const roster = agentsQuery.data?.roster ?? [];
  const agentsOnline = roster.filter((agent) => agent.liveCount > 0).length;
  const waitingFromRoster = roster.reduce((sum, agent) => sum + agent.waitingCount, 0);

  const inProgress = liveList.filter((chat) => {
    const status = (chat.status ?? "").toLowerCase();
    return status === "active" || status === "assigned";
  }).length;

  const waitingChats = liveList.filter(
    (chat) => (chat.status ?? "").toLowerCase() === "waiting",
  ).length;

  const escalated = liveList.filter((chat) => Boolean(chat.supervisorControlUserId)).length;

  const longestWaitSeconds = liveList.reduce((max, chat) => {
    if ((chat.status ?? "").toLowerCase() !== "waiting" || !chat.startedAt) return max;
    const started = new Date(chat.startedAt).getTime();
    if (Number.isNaN(started)) return max;
    return Math.max(max, Math.floor((Date.now() - started) / 1000));
  }, 0);

  return {
    enabled,
    loading:
      enabled &&
      (capabilitiesQuery.isLoading || liveQuery.isLoading || agentsQuery.isLoading),
    liveList,
    roster,
    agentsOnline,
    agentsTotal: roster.length,
    inProgress,
    waitingChats: Math.max(waitingChats, waitingFromRoster),
    escalated,
    longestWaitSeconds,
  };
}
