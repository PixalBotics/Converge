import type { ChatReportMetricBucket } from "@/services/chat/reports.types";
import type { ConversationSummary } from "@/services/chat/chat.types";
import type { MonitorAgentRef, MonitorConversationRow } from "@/services/chat/monitor.types";
import type { QaUserLabel } from "@/services/chat/qa.types";
import { formatDurationSeconds } from "@/features/chat-reports/utils/format-metric";

export const DASHBOARD_DATE_RANGE_OPTIONS = [
  "Last 7 Days",
  "Last 30 Days",
  "Last 90 Days",
] as const;

export type DashboardDateRangeLabel = (typeof DASHBOARD_DATE_RANGE_OPTIONS)[number];

const DATE_RANGE_DAYS: Record<DashboardDateRangeLabel, number> = {
  "Last 7 Days": 7,
  "Last 30 Days": 30,
  "Last 90 Days": 90,
};

export function reportRangeForLabel(label: string): { from: string; to: string } {
  const days =
    DATE_RANGE_DAYS[label as DashboardDateRangeLabel] ?? DATE_RANGE_DAYS["Last 30 Days"];
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function formatDashboardCount(value: number | undefined | null, loading = false): string {
  if (loading) return "…";
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString();
}

export function formatTodayHeader(): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());
}

export function shortConversationId(id: string): string {
  const trimmed = id.trim();
  if (!trimmed) return "—";
  return `#${trimmed.slice(-6).toUpperCase()}`;
}

export function qaUserDisplayName(user?: QaUserLabel | null): string {
  if (!user) return "—";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.email || user.id.slice(0, 8);
}

export function monitorAgentDisplayName(agent?: MonitorAgentRef | null): string {
  if (!agent) return "—";
  const name = [agent.firstName, agent.lastName].filter(Boolean).join(" ").trim();
  return name || agent.email || agent.id.slice(0, 8);
}

export function conversationVisitorName(
  row: ConversationSummary | MonitorConversationRow,
): string {
  const vp = row.visitorPresentation;
  if (vp?.displayName?.trim()) return vp.displayName.trim();
  if (vp?.inboxTitle?.trim()) return vp.inboxTitle.trim();
  const visitor = "visitor" in row ? row.visitor : undefined;
  if (visitor && typeof visitor === "object") {
    const name = String((visitor as Record<string, unknown>).name ?? "").trim();
    if (name) return name;
  }
  return "Visitor";
}

export function conversationWebsiteLabel(row: ConversationSummary): string {
  const vp = row.visitorPresentation;
  if (vp?.websiteUrl?.trim()) return vp.websiteUrl.trim();
  if (vp?.websiteName?.trim()) return vp.websiteName.trim();
  if (vp?.originLabel?.trim()) return vp.originLabel.trim();
  return "—";
}

export function elapsedDurationLabel(fromIso?: string | null): string {
  if (!fromIso) return "—";
  const start = new Date(fromIso).getTime();
  if (Number.isNaN(start)) return "—";
  const seconds = Math.max(0, Math.floor((Date.now() - start) / 1000));
  return formatDurationSeconds(seconds);
}

export function isTodayUtc(iso?: string | null): boolean {
  if (!iso) return false;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return (
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCDate() === now.getUTCDate()
  );
}

export function paginateRows<T>(rows: T[], page: number, pageSize: number) {
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;
  return {
    rows: rows.slice(start, start + pageSize),
    pageCount,
    total,
    safePage,
  };
}

export function departmentBarChartData(buckets: ChatReportMetricBucket[]) {
  return buckets.slice(0, 7).map((bucket, index) => ({
    name: bucket.label.length > 12 ? `${bucket.label.slice(0, 10)}…` : bucket.label,
    value: bucket.conversationCount,
    fill: (index % 2 === 0 ? "first" : "second") as "first" | "second",
  }));
}

export function routingVolumeLineData(buckets: ChatReportMetricBucket[]) {
  return buckets.slice(0, 7).map((bucket, index) => ({
    day: index + 1,
    value: bucket.conversationCount,
  }));
}

export function chartYMax(values: number[], floor = 10): number {
  const max = values.length ? Math.max(...values) : 0;
  return Math.max(floor, max);
}

export function lastMessagePreview(row: MonitorConversationRow): string {
  const raw = row.lastMessage;
  if (!raw || typeof raw !== "object") return "—";
  const content = String((raw as Record<string, unknown>).content ?? "").trim();
  return content || "—";
}
