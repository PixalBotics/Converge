import type { MonitorListFilters } from "@/services/chat/monitor.types";

export const chatMonitorKeys = {
  all: ["chat-monitor"] as const,
  capabilities: () => [...chatMonitorKeys.all, "capabilities"] as const,
  live: (filters: MonitorListFilters) => [...chatMonitorKeys.all, "live", filters] as const,
  closed: (filters: MonitorListFilters) => [...chatMonitorKeys.all, "closed", filters] as const,
  transcript: (conversationId: string) =>
    [...chatMonitorKeys.all, "transcript", conversationId] as const,
};
