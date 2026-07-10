"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import {
  AttachMoney as AttachMoneyIcon,
  BarChart as BarChartIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import type { AppTheme } from "@/theme/theme";
import { userIconPath } from "@/assets";
import { MetricCard } from "@/components/common";
import {
  DashboardCard,
  DataTable,
  Dropdown,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import {
  activeChatsPill,
  agentPerformanceTableWrap,
  avgRatingBox,
  cardAgentPerformance,
  cardLiveOverview,
  chartBox220,
  chartBoxDepartmentPerformance,
  chartFlexFill,
  chartLoadingBox,
  chatAnalyticsIconBox,
  chatVolumeIconBox,
  chatVolumeResolvedColor,
  chatVolumeSummaryDivider,
  chatVolumeSummaryItem,
  chatVolumeSummaryLabel,
  chatVolumeSummaryPanel,
  chatVolumeSummaryWrapper,
  dashboardChartRowCard,
  grid2Lg,
  grid4,
  gridAgentLiveOverview,
  iconSize22,
  last30DaysButton,
  liveOverviewAvatar,
  liveOverviewAvatarIcon,
  liveOverviewChatContent,
  liveOverviewChatList,
  liveOverviewChatMessage,
  liveOverviewChatName,
  liveOverviewChatRow,
  liveOverviewChatTime,
  liveOverviewHeaderIconBox,
  liveOverviewIconSize,
  liveOverviewRefreshButton,
  liveOverviewSectionTitle,
  liveOverviewWaitingCard,
  overviewHeader,
  overviewHeaderDropdownWrap,
  pageWrapper,
  dashboardEmbeddedOverviewRoot,
  embeddedOverviewToolbar,
  revenueHeaderRow,
  revenueTitleRow,
  revenueTitleRowMb2,
  starIconYellow,
  tableAvatar,
  tableAvatarIcon,
  tableUserCellBox,
  waitingQueueCountRow,
  waitingQueueLabel,
} from "../dashboard.styles";

const ChatAnalyticsBarChart = dynamic(
  () =>
    import("@/components/common/Charts").then((m) => ({
      default: m.ChatAnalyticsBarChart,
    })),
  { ssr: false, loading: () => <Box sx={chartLoadingBox} /> },
);

const ChatVolumeChart = dynamic(
  () =>
    import("@/components/common/Charts").then((m) => ({
      default: m.ChatVolumeChart,
    })),
  { ssr: false, loading: () => <Box sx={chartLoadingBox} /> },
);

import { formatDurationSeconds, formatScore } from "@/features/chat-reports/utils/format-metric";
import { formatRelativeQueueTime } from "@/features/chat-operations/utils/format-message-time";
import {
  chartYMax,
  conversationVisitorName,
  DASHBOARD_DATE_RANGE_OPTIONS,
  departmentBarChartData,
  formatDashboardCount,
  lastMessagePreview,
  routingVolumeLineData,
} from "../components/dashboard-chat.utils";
import {
  useDashboardChatReports,
  useDashboardMonitorSnapshot,
} from "../components/use-dashboard-chat-data";

interface AgentPerformanceRow extends Record<string, unknown> {
  agentName: string;
  activeChats: number;
  closedToday: number;
  avgRating: string;
  avgResponse: string;
}

export default function CompanyAdminOverview({ embedded = false }: { embedded?: boolean }) {
  const theme = useTheme() as AppTheme;
  const [dateRangeValue, setDateRangeValue] = useState("Last 30 Days");
  const reports = useDashboardChatReports(dateRangeValue);
  const monitor = useDashboardMonitorSnapshot();

  const summary = reports.overview?.summary;
  const metricsLoading = reports.loading || monitor.loading;

  const departmentPerformanceBarData = useMemo(
    () => departmentBarChartData(reports.overview?.byDepartment ?? []),
    [reports.overview?.byDepartment],
  );

  const chatVolumeLineData = useMemo(
    () => routingVolumeLineData(reports.overview?.byRoutingKey ?? []),
    [reports.overview?.byRoutingKey],
  );

  const liveCountByAgent = useMemo(() => {
    const map = new Map<string, number>();
    for (const chat of monitor.liveList) {
      if (!chat.agentId) continue;
      const status = (chat.status ?? "").toLowerCase();
      if (status === "active" || status === "assigned") {
        map.set(chat.agentId, (map.get(chat.agentId) ?? 0) + 1);
      }
    }
    return map;
  }, [monitor.liveList]);

  const agentPerformanceRows = useMemo<AgentPerformanceRow[]>(() => {
    return (reports.overview?.byAgent ?? []).slice(0, 8).map((bucket) => ({
      agentName: bucket.label,
      activeChats: liveCountByAgent.get(bucket.key) ?? 0,
      closedToday: bucket.closedCount,
      avgRating: formatScore(bucket.avgCsatScore ?? bucket.avgQaScore),
      avgResponse: formatDurationSeconds(bucket.avgFirstResponseSeconds),
    }));
  }, [liveCountByAgent, reports.overview?.byAgent]);

  const liveOverviewChats = useMemo(
    () =>
      monitor.liveList.slice(0, 5).map((chat) => ({
        id: chat.id,
        name: conversationVisitorName(chat),
        message: lastMessagePreview(chat),
        time: formatRelativeQueueTime(chat.startedAt),
      })),
    [monitor.liveList],
  );

  const agentPerformanceColumns = useMemo<DataTableColumn<AgentPerformanceRow>[]>(
    () => [
      {
        id: "agentName",
        label: "Agent Name",
        render: (_, row) => (
          <Box sx={tableUserCellBox}>
            <Avatar src={userIconPath} sx={tableAvatar}>
              <PersonIcon sx={tableAvatarIcon} />
            </Avatar>
            <Typography component="span" variant="body2" color="white" fontWeight={500}>
              {row.agentName}
            </Typography>
          </Box>
        ),
      },
      {
        id: "activeChats",
        label: "Active Chats",
        render: (_, row) => (
          <Box component="span" sx={activeChatsPill}>
            {row.activeChats} Active
          </Box>
        ),
      },
      { id: "closedToday", label: "Closed Today" },
      {
        id: "avgRating",
        label: "Avg Rating",
        render: (_, row) => (
          <Box sx={avgRatingBox}>
            <StarIcon sx={starIconYellow} />
            <Typography component="span" variant="body2" color="white">
              {row.avgRating}
            </Typography>
          </Box>
        ),
      },
      { id: "avgResponse", label: "Avg Response", cellVariant: "muted" },
    ],
    [],
  );

  return (
    <Box sx={embedded ? dashboardEmbeddedOverviewRoot : pageWrapper}>
      <Box sx={embedded ? embeddedOverviewToolbar : overviewHeader}>
        {!embedded ? (
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Company Admin dashboard
          </Typography>
        ) : null}
        <Box sx={overviewHeaderDropdownWrap}>
          <Dropdown
            id="date-range-menu-employee"
            options={[...DASHBOARD_DATE_RANGE_OPTIONS]}
            value={dateRangeValue}
            onChange={setDateRangeValue}
            buttonSx={last30DaysButton}
            endIcon="▾"
          />
        </Box>
      </Box>


      <Box sx={grid4}>
        <MetricCard
          title="Active Agents"
          value={formatDashboardCount(monitor.agentsOnline, metricsLoading)}
          subtitle={`${formatDashboardCount(monitor.agentsTotal, metricsLoading)} agents in roster`}
          icon={<BarChartIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentBlue}
          valueColor={theme.app.dashboard.accentBlue}
          subtitleColor={theme.app.dashboard.white95}
          showTrendArrow={false}
        />
        <MetricCard
          title="Active Chats"
          value={formatDashboardCount(monitor.inProgress, metricsLoading)}
          subtitle={`${formatDashboardCount(monitor.waitingChats, metricsLoading)} waiting`}
          icon={<BarChartIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentOrange}
          valueColor={theme.app.dashboard.accentOrange}
          subtitleColor={theme.app.dashboard.white95}
        />
        <MetricCard
          title="Avg Response Time"
          value={metricsLoading ? "…" : formatDurationSeconds(summary?.avgFirstResponseSeconds)}
          subtitle={`Handle ${metricsLoading ? "…" : formatDurationSeconds(summary?.avgHandleSeconds)}`}
          icon={<BarChartIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentPurple}
          valueColor={theme.app.dashboard.accentPurple}
          subtitleColor={theme.app.dashboard.white95}
        />
        <MetricCard
          title="QA Average Rating"
          value={metricsLoading ? "…" : formatScore(summary?.avgQaScore ?? reports.overview?.qa.avgOverallScore)}
          subtitle={`${formatDashboardCount(reports.overview?.qa.completed, metricsLoading)} QA reviews completed`}
          icon={<BarChartIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentPink}
          valueColor={theme.app.dashboard.accentPink}
          subtitleColor={theme.app.dashboard.white95}
        />
      </Box>

      <Box sx={grid2Lg}>
        <DashboardCard sx={dashboardChartRowCard}>
          <Box sx={revenueHeaderRow}>
            <Box sx={revenueTitleRow}>
              <Box sx={chatAnalyticsIconBox}>
                <PersonIcon sx={iconSize22} />
              </Box>
              <Typography variant="subtitle1" fontWeight={600} color="white">
                Department Performance
              </Typography>
            </Box>
          </Box>
          <Box sx={chartFlexFill}>
            <Box sx={chartBoxDepartmentPerformance}>
              {departmentPerformanceBarData.length === 0 ? (
                <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, py: 4 }}>
                  No department data for this range.
                </Typography>
              ) : (
                <ChatAnalyticsBarChart
                  data={departmentPerformanceBarData}
                  height={320}
                  yDomain={[0, chartYMax(departmentPerformanceBarData.map((d) => d.value))]}
                  yTickFormatter={(v) => String(v)}
                  tooltipFormatter={(v) => String(v)}
                />
              )}
            </Box>
          </Box>
        </DashboardCard>
        <DashboardCard sx={dashboardChartRowCard}>
          <Box sx={revenueHeaderRow}>
            <Box sx={revenueTitleRow}>
              <Box sx={chatVolumeIconBox}>
                <ChatIcon sx={iconSize22} />
              </Box>
              <Typography variant="subtitle1" fontWeight={600} color="white">
                Chat Volume
              </Typography>
            </Box>
          </Box>
          <Box sx={chartFlexFill}>
            <Box sx={chartBox220}>
              {chatVolumeLineData.length === 0 ? (
                <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, py: 4 }}>
                  No chat volume data for this range.
                </Typography>
              ) : (
                <ChatVolumeChart
                  data={chatVolumeLineData}
                  height={220}
                  yDomain={[0, chartYMax(chatVolumeLineData.map((d) => d.value))]}
                  yTickFormatter={(v) => String(v)}
                  tooltipFormatter={(v) => String(v)}
                />
              )}
            </Box>
            <Box sx={chatVolumeSummaryWrapper}>
              <DashboardCard sx={chatVolumeSummaryPanel}>
                <Box sx={chatVolumeSummaryItem}>
                  <Typography
                    variant="medium16"
                    sx={{
                      color: theme.app.dashboard.white7,
                      ...chatVolumeSummaryLabel,
                    } as object}
                  >
                    Total Chats
                  </Typography>
                  <Typography variant="medium16" color="white">
                    {formatDashboardCount(summary?.conversationCount, metricsLoading)}
                  </Typography>
                </Box>
                <Box sx={chatVolumeSummaryDivider} />
                <Box sx={chatVolumeSummaryItem}>
                  <Typography
                    variant="medium16"
                    sx={{
                      color: theme.app.dashboard.white7,
                      ...chatVolumeSummaryLabel,
                    } as object}
                  >
                    Resolved
                  </Typography>
                  <Typography variant="medium16" sx={chatVolumeResolvedColor}>
                    {formatDashboardCount(summary?.closedCount, metricsLoading)}
                  </Typography>
                </Box>
              </DashboardCard>
            </Box>
          </Box>
        </DashboardCard>
      </Box>

      <Box sx={gridAgentLiveOverview}>
        <DashboardCard sx={cardAgentPerformance}>
          <Box sx={revenueTitleRowMb2}>
            <Box sx={chatAnalyticsIconBox}>
              <PersonIcon sx={iconSize22} />
            </Box>
            <Typography variant="subtitle1" fontWeight={600} color="white">
              Agent Performance
            </Typography>
          </Box>
          <Box sx={agentPerformanceTableWrap}>
            {agentPerformanceRows.length === 0 ? (
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, py: 2 }}>
                No agent performance data for this range.
              </Typography>
            ) : (
              <DataTable<AgentPerformanceRow>
                columns={agentPerformanceColumns}
                rows={agentPerformanceRows}
                getRowId={(row, idx) => `agent-${row.agentName}-${idx}`}
                minWidth={560}
              />
            )}
          </Box>
        </DashboardCard>
        <DashboardCard sx={cardLiveOverview}>
          <Box sx={revenueTitleRowMb2}>
            <Box sx={liveOverviewHeaderIconBox}>
              <AttachMoneyIcon sx={liveOverviewIconSize} />
            </Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{ color: theme.app.dashboard.white95 }}
            >
              Live Overview
            </Typography>
          </Box>
          <DashboardCard sx={liveOverviewWaitingCard}>
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: theme.app.dashboard.white65,
                  ...waitingQueueLabel,
                } as object}
              >
                Waiting Queue
              </Typography>
              <Box sx={waitingQueueCountRow}>
                <Typography component="span" variant="mediumLarge">
                  {formatDashboardCount(monitor.waitingChats, monitor.loading)}
                </Typography>
                <Typography component="span" variant="mediumLarge">
                  Chats
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              sx={liveOverviewRefreshButton}
              onClick={() => void reports.refresh()}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </DashboardCard>
          <Typography variant="subtitle1" sx={liveOverviewSectionTitle}>
            Currently Active (Recent)
          </Typography>
          <Box sx={liveOverviewChatList}>
            {liveOverviewChats.length === 0 ? (
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, py: 2 }}>
                No live chats right now.
              </Typography>
            ) : (
              liveOverviewChats.map((chat) => (
                <Box key={chat.id} sx={liveOverviewChatRow}>
                <Avatar sx={liveOverviewAvatar}>
                  <PersonIcon sx={liveOverviewAvatarIcon} />
                </Avatar>
                <Box sx={liveOverviewChatContent}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ color: theme.app.dashboard.white95, ...liveOverviewChatName } as object}
                  >
                    {chat.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.app.dashboard.white60,
                      ...liveOverviewChatMessage,
                    } as object}
                  >
                    {chat.message}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: theme.app.dashboard.white60, ...liveOverviewChatTime } as object}
                >
                  {chat.time}
                </Typography>
              </Box>
              ))
            )}
          </Box>
        </DashboardCard>
      </Box>
    </Box>
  );
}
