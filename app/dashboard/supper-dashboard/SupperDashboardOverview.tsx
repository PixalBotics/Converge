"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import type { AppTheme } from "@/theme/theme";
import {
  Typography,
  DashboardCard,
  Dropdown,
  SegmentedControl,
  DataTable,
  dataTableActionButton,
  TablePagination,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { MetricCard } from "@/components/common";
import { fetchAuditLogs } from "@/api/observability/observability-logs.api";
import type { AuditLogListItem } from "@/api/observability/observability-logs.types";
import type { DashboardTrend } from "@/api/dashboard";
import { ChatsByDepartmentIcon } from "@/components/common/icons";
import { userIconPath } from "@/assets";
import { usePlatformOverviewQuery } from "@/lib/hooks/query";
import {
  Chat as ChatIcon,
  Business as BusinessIcon,
  Public as PublicIcon,
  People as PeopleIcon,
  Headset as HeadsetIcon,
  AttachMoney as AttachMoneyIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  MoreHoriz as MoreHorizIcon,
  List as ListIcon,
} from "@mui/icons-material";
import {
  pageWrapper,
  dashboardEmbeddedOverviewRoot,
  embeddedOverviewToolbar,
  overviewHeader,
  last30DaysButton,
  grid3,
  grid3Lg,
  revenueCardsColumn,
  grid2Lg,
  grid4,
  cardPadding,
  cardPaddingAutoHeight,
  revenueHeaderRow,
  revenueTitleRow,
  revenueIconBox,
  chatAnalyticsIconBox,
  chartBox220,
  chartBox260,
  chartBox280,
  iconSize22,
  overviewHeaderDropdownWrap,
  chartLoadingBox,
  chartLoadingBox260,
  chartLoadingBox280,
  tableUserCellBox,
  tableAvatar,
  tableAvatarIcon,
  chartFlexFill,
  dashboardChartRowCard,
  revenueTitleRowMb2,
  revenueIconSmall,
} from "../dashboard.styles";

const RevenueLineChart = dynamic(
  () =>
    import("@/components/common/Charts").then((m) => ({
      default: m.RevenueLineChart,
    })),
  { ssr: false, loading: () => <Box sx={chartLoadingBox} /> },
);

const ChatAnalyticsBarChart = dynamic(
  () =>
    import("@/components/common/Charts").then((m) => ({
      default: m.ChatAnalyticsBarChart,
    })),
  { ssr: false, loading: () => <Box sx={chartLoadingBox260} /> },
);

const DepartmentPieChart = dynamic(
  () =>
    import("@/components/common/Charts").then((m) => ({
      default: m.DepartmentPieChart,
    })),
  { ssr: false, loading: () => <Box sx={chartLoadingBox280} /> },
);

const DATE_RANGE_OPTIONS = ["Last 7 Days", "Last 30 Days", "Last 90 Days"] as const;
const DATE_RANGE_DAYS: Record<(typeof DATE_RANGE_OPTIONS)[number], number> = {
  "Last 7 Days": 7,
  "Last 30 Days": 30,
  "Last 90 Days": 90,
};

export type PlatformDashboardBlock =
  | "primary-metrics"
  | "user-metrics"
  | "revenue"
  | "chat-charts"
  | "status-metrics"
  | "activity-log";

const ALL_PLATFORM_BLOCKS: readonly PlatformDashboardBlock[] = [
  "primary-metrics",
  "user-metrics",
  "revenue",
  "chat-charts",
  "status-metrics",
  "activity-log",
];

type ActivityLogRow = {
  activityType: string;
  user: string;
  module: string;
  date: string;
  time: string;
  userImage?: string;
};

function formatCount(value: number | undefined, loading: boolean): string {
  if (loading) return "…";
  return new Intl.NumberFormat().format(value ?? 0);
}

function formatCurrency(
  value: number | undefined,
  currency: string,
  loading: boolean,
): string {
  if (loading) return "…";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value ?? 0);
  } catch {
    return `${currency} ${(value ?? 0).toFixed(2)}`;
  }
}

function trendSubtitle(trend: DashboardTrend | undefined, loading: boolean): string {
  if (loading) return "Loading…";
  if (!trend) return "No comparison data";
  const pct = trend.changePercent;
  if (pct == null) {
    return trend.previous === 0 && trend.current > 0
      ? "New activity vs prior period"
      : "No change from prior period";
  }
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}% vs prior period`;
}

function mapAuditRow(item: AuditLogListItem): ActivityLogRow {
  const created = new Date(item.createdAt);
  const actorName = item.actor
    ? [item.actor.firstName, item.actor.lastName].filter(Boolean).join(" ").trim() ||
      item.actor.email
    : "System";
  const moduleLabel = item.website?.name ?? item.website?.url ?? "Platform";
  return {
    activityType: item.eventType.replace(/[._]/g, " "),
    user: actorName,
    module: moduleLabel,
    date: new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }).format(created),
    time: new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(created),
  };
}

export default function SupperDashboardOverview({
  embedded = false,
  blocks,
}: {
  embedded?: boolean;
  blocks?: readonly PlatformDashboardBlock[];
}) {
  const theme = useTheme() as AppTheme;
  const activeBlocks = blocks ?? ALL_PLATFORM_BLOCKS;
  const showBlock = (block: PlatformDashboardBlock) => activeBlocks.includes(block);
  const showDateHeader =
    showBlock("primary-metrics") ||
    showBlock("user-metrics") ||
    showBlock("revenue") ||
    showBlock("chat-charts") ||
    showBlock("status-metrics");
  const [dateRangeValue, setDateRangeValue] =
    useState<(typeof DATE_RANGE_OPTIONS)[number]>("Last 30 Days");
  const [revenueGranularity, setRevenueGranularity] = useState<
    "weekly" | "monthly" | "today"
  >("monthly");
  const [chatAnalyticsWindow, setChatAnalyticsWindow] = useState<
    "7days" | "monthly"
  >("7days");
  const [activityPage, setActivityPage] = useState(1);

  const days = DATE_RANGE_DAYS[dateRangeValue];
  const overviewQuery = usePlatformOverviewQuery({
    days,
    revenueGranularity,
    chatAnalyticsWindow,
  });
  const auditLogsQuery = useQuery({
    queryKey: ["dashboard", "activity-log", activityPage],
    queryFn: () => fetchAuditLogs({ page: activityPage, limit: 10 }),
    staleTime: 60_000,
  });

  const loading = overviewQuery.isLoading;
  const data = overviewQuery.data;
  const metrics = data?.metrics;
  const currency = data?.currency ?? "USD";

  const activityRows = useMemo(
    () => (auditLogsQuery.data?.items ?? []).map(mapAuditRow),
    [auditLogsQuery.data?.items],
  );
  const activityPageCount = auditLogsQuery.data?.totalPages ?? 1;

  const activityColumns = useMemo<DataTableColumn<ActivityLogRow>[]>(
    () => [
      { id: "activityType", label: "Activity Type" },
      {
        id: "user",
        label: "User",
        render: (_, row) => {
          const name = String(row.user ?? "");
          const hasImage = typeof row.userImage === "string";
          return (
            <Box sx={tableUserCellBox}>
              <Avatar src={hasImage ? row.userImage : userIconPath} sx={tableAvatar}>
                {!hasImage && <PersonIcon sx={tableAvatarIcon} />}
              </Avatar>
              <Typography component="span" variant="body2" color="white" fontWeight={500}>
                {name}
              </Typography>
            </Box>
          );
        },
      },
      { id: "module", label: "Module" },
      { id: "date", label: "Date", cellVariant: "muted" },
      { id: "time", label: "Time", cellVariant: "muted" },
    ],
    [],
  );

  const departmentChartData =
    data?.chatsByDepartment.length
      ? data.chatsByDepartment
      : [{ name: "No data", value: 1, color: "rgba(255,255,255,0.2)" }];

  return (
    <Box sx={embedded ? dashboardEmbeddedOverviewRoot : pageWrapper}>
      {showDateHeader ? (
      <Box sx={embedded ? embeddedOverviewToolbar : overviewHeader}>
        {!embedded ? (
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Dashboard
          </Typography>
        ) : null}
        <Box sx={overviewHeaderDropdownWrap}>
          <Dropdown
            id="date-range-menu"
            options={[...DATE_RANGE_OPTIONS]}
            value={dateRangeValue}
            onChange={(value) =>
              setDateRangeValue(value as (typeof DATE_RANGE_OPTIONS)[number])
            }
            buttonSx={last30DaysButton}
            endIcon="▾"
          />
        </Box>
      </Box>
      ) : null}

      {showBlock("primary-metrics") ? (
      <Box sx={grid3}>
        <MetricCard
          title="Today Total Chats"
          value={formatCount(metrics?.todayTotalChats.current, loading)}
          subtitle={trendSubtitle(metrics?.todayTotalChats, loading)}
          icon={<ChatIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentBlue}
          showTrendArrow={!loading && (metrics?.todayTotalChats.changePercent ?? 0) > 0}
        />
        <MetricCard
          title="Total Companies"
          value={formatCount(metrics?.totalCompanies.current, loading)}
          subtitle={trendSubtitle(metrics?.totalCompanies, loading)}
          icon={<BusinessIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentOrange}
          showTrendArrow={!loading && (metrics?.totalCompanies.changePercent ?? 0) > 0}
        />
        <MetricCard
          title="Total Active Websites"
          value={formatCount(metrics?.totalActiveWebsites.current, loading)}
          subtitle={trendSubtitle(metrics?.totalActiveWebsites, loading)}
          icon={<PublicIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentBlue}
          showTrendArrow={
            !loading && (metrics?.totalActiveWebsites.changePercent ?? 0) > 0
          }
        />
      </Box>
      ) : null}

      {showBlock("user-metrics") ? (
      <Box sx={grid3}>
        <MetricCard
          title="Total Active Users"
          value={formatCount(metrics?.totalActiveUsers.current, loading)}
          subtitle={trendSubtitle(metrics?.totalActiveUsers, loading)}
          icon={<PeopleIcon sx={iconSize22} />}
          iconBgColor="#A855F7"
          showTrendArrow={!loading && (metrics?.totalActiveUsers.changePercent ?? 0) > 0}
        />
        <MetricCard
          title="Live Chat"
          value={formatCount(metrics?.liveChats.current, loading)}
          subtitle={trendSubtitle(metrics?.liveChats, loading)}
          icon={<HeadsetIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentPink}
          showTrendArrow={!loading && (metrics?.liveChats.changePercent ?? 0) > 0}
        />
        <MetricCard
          title="Today Closed Chats"
          value={formatCount(metrics?.todayClosedChats.current, loading)}
          subtitle={trendSubtitle(metrics?.todayClosedChats, loading)}
          icon={<ChatIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentBlue}
          showTrendArrow={
            !loading && (metrics?.todayClosedChats.changePercent ?? 0) > 0
          }
        />
      </Box>
      ) : null}

      {showBlock("revenue") ? (
      <Box sx={grid3Lg}>
        <Box sx={revenueCardsColumn}>
          <MetricCard
            title="Monthly Revenue"
            value={formatCurrency(metrics?.monthlyRevenue.current, currency, loading)}
            subtitle={trendSubtitle(metrics?.monthlyRevenue, loading)}
            icon={<AttachMoneyIcon sx={iconSize22} />}
            iconBgColor={theme.app.dashboard.accentPink}
            showTrendArrow={!loading && (metrics?.monthlyRevenue.changePercent ?? 0) > 0}
          />
          <MetricCard
            title="Today Revenue"
            value={formatCurrency(metrics?.todayRevenue.current, currency, loading)}
            subtitle={trendSubtitle(metrics?.todayRevenue, loading)}
            icon={<AttachMoneyIcon sx={iconSize22} />}
            iconBgColor={theme.app.dashboard.accentBlue}
            showTrendArrow={!loading && (metrics?.todayRevenue.changePercent ?? 0) > 0}
          />
        </Box>
        <DashboardCard sx={cardPadding}>
          <Box sx={revenueHeaderRow}>
            <Box sx={revenueTitleRow}>
              <Box sx={revenueIconBox}>
                <AttachMoneyIcon sx={revenueIconSmall} />
              </Box>
              <Typography variant="subtitle1" fontWeight={600} color="white">
                Revenue Overview
              </Typography>
            </Box>
            <SegmentedControl
              options={[
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
                { value: "today", label: "Today's" },
              ]}
              value={revenueGranularity}
              onChange={(value) =>
                setRevenueGranularity(value as "weekly" | "monthly" | "today")
              }
              variant="default"
            />
          </Box>
          <Box sx={chartBox220}>
            <RevenueLineChart data={data?.revenueChart ?? []} />
          </Box>
        </DashboardCard>
      </Box>
      ) : null}

      {showBlock("chat-charts") ? (
      <Box sx={grid2Lg}>
        <DashboardCard sx={dashboardChartRowCard}>
          <Box sx={revenueHeaderRow}>
            <Box sx={revenueTitleRow}>
              <Box sx={chatAnalyticsIconBox}>
                <ChatIcon sx={iconSize22} />
              </Box>
              <Typography variant="subtitle1" fontWeight={600} color="white">
                Chat Analytics
              </Typography>
            </Box>
            <SegmentedControl
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "7days", label: "last 7 Days" },
              ]}
              value={chatAnalyticsWindow}
              onChange={(value) =>
                setChatAnalyticsWindow(value as "7days" | "monthly")
              }
              variant="default"
            />
          </Box>
          <Box sx={chartFlexFill}>
            <Box sx={chartBox260}>
              <ChatAnalyticsBarChart data={data?.chatAnalytics ?? []} />
            </Box>
          </Box>
        </DashboardCard>
        <DashboardCard sx={dashboardChartRowCard}>
          <Box sx={revenueTitleRowMb2}>
            <ChatsByDepartmentIcon />
            <Typography variant="subtitle1" fontWeight={600} color="white">
              Chats by Department
            </Typography>
          </Box>
          <Box sx={chartFlexFill}>
            <Box sx={chartBox280}>
              <DepartmentPieChart data={departmentChartData} />
            </Box>
          </Box>
        </DashboardCard>
      </Box>
      ) : null}

      {showBlock("status-metrics") ? (
      <Box sx={grid4}>
        <MetricCard
          title="Agents Online"
          value={
            loading
              ? "…"
              : `${metrics?.agentsOnline ?? 0}/${metrics?.agentsTotal ?? 0}`
          }
          subtitle="Agents accepting chats right now"
          icon={<PersonIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentBlue}
          showTrendArrow={false}
        />
        <MetricCard
          title="License Missing"
          value={formatCount(metrics?.licensesMissing, loading)}
          subtitle="Parent companies without a license key"
          icon={<WarningIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentRed}
          subtitleColor={theme.app.dashboard.accentRed}
          showTrendArrow={false}
        />
        <MetricCard
          title="Reached PA"
          value={formatCurrency(
            metrics?.platformFeesReceived.current,
            currency,
            loading,
          )}
          subtitle={trendSubtitle(metrics?.platformFeesReceived, loading)}
          icon={<AttachMoneyIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentBlue}
          showTrendArrow={
            !loading && (metrics?.platformFeesReceived.changePercent ?? 0) > 0
          }
        />
        <MetricCard
          title="System Status"
          value={
            loading
              ? "…"
              : metrics?.systemStatus === "operational"
                ? "Operational"
                : "Degraded"
          }
          subtitle={metrics?.systemStatusDetail ?? "Checking services"}
          icon={<CheckCircleIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentBlue}
          showTrendArrow={false}
        />
      </Box>
      ) : null}

      {showBlock("activity-log") ? (
      <DashboardCard sx={cardPaddingAutoHeight}>
        <Box sx={revenueTitleRowMb2}>
          <Box sx={chatAnalyticsIconBox}>
            <ListIcon sx={iconSize22} />
          </Box>
          <Typography variant="subtitle1" fontWeight={600} color="white">
            Recent Activity Log
          </Typography>
        </Box>
        <DataTable<ActivityLogRow>
          columns={activityColumns}
          rows={activityRows}
          getRowId={(row) => `${row.activityType}-${row.date}-${row.time}-${row.user}`}
          actionColumn={{
            label: "Action",
            render: () => (
              <IconButton size="small" sx={dataTableActionButton}>
                <MoreHorizIcon fontSize="small" />
              </IconButton>
            ),
          }}
          minWidth={560}
        />
        <Box
          sx={{
            mt: 1.5,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <TablePagination
            page={activityPage}
            pageCount={activityPageCount}
            onPageChange={setActivityPage}
          />
        </Box>
      </DashboardCard>
      ) : null}
    </Box>
  );
}
