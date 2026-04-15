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
import { MetricCard } from "@/components/dashboard";
import {
  DashboardCard,
  DataTable,
  Dropdown,
  SegmentedControl,
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

const DATE_RANGE_OPTIONS = ["Last 7 Days", "Last 30 Days", "Last 90 Days"];

const departmentPerformanceBarData = [
  { name: "Sales", value: 40, fill: "first" as const },
  { name: "Supports", value: 30, fill: "second" as const },
  { name: "Billing", value: 40, fill: "first" as const },
  { name: "Tech", value: 60, fill: "second" as const },
  { name: "Retention", value: 75, fill: "first" as const },
  { name: "Tech", value: 50, fill: "second" as const },
  { name: "Sales", value: 35, fill: "first" as const },
];

const chatVolumeLineData = [
  { day: 1, value: 80 },
  { day: 2, value: 120 },
  { day: 3, value: 95 },
  { day: 4, value: 160 },
  { day: 5, value: 140 },
  { day: 6, value: 180 },
  { day: 7, value: 100 },
];

const agentPerformanceRows = [
  {
    agentName: "Sarah Jenkins",
    activeChats: 2,
    closedToday: 10982,
    avgRating: 4.5,
    avgResponse: "45s",
  },
  {
    agentName: "Mike Ross",
    activeChats: 0,
    closedToday: 82,
    avgRating: 5.0,
    avgResponse: "1m 12s",
  },
  {
    agentName: "Emily Chen",
    activeChats: 7,
    closedToday: 982,
    avgRating: 4.2,
    avgResponse: "58s",
  },
  {
    agentName: "David Kim",
    activeChats: 2,
    closedToday: 2,
    avgRating: 4.9,
    avgResponse: "1m 05s",
  },
  {
    agentName: "Sarah Jenkins",
    activeChats: 4,
    closedToday: 1231,
    avgRating: 3.9,
    avgResponse: "18s",
  },
  {
    agentName: "Mike Ross",
    activeChats: 7,
    closedToday: 0,
    avgRating: 5.0,
    avgResponse: "2m 05s",
  },
];

const liveOverviewChats = [
  {
    name: "Courtney Henry",
    message: "I need help with my subscription upgrade...",
    time: "2m ago",
  },
  {
    name: "Robert Fox",
    message: "Is there a discount for annual plans?",
    time: "1m ago",
  },
  { name: "John Smith", message: "Connecting to agent...", time: "12m ago" },
];

interface AgentPerformanceRow extends Record<string, unknown> {
  agentName: string;
  activeChats: number;
  closedToday: number;
  avgRating: number;
  avgResponse: string;
}

export default function CompanyAdminOverview() {
  const theme = useTheme() as AppTheme;
  const [dateRangeValue, setDateRangeValue] = useState("Last 30 Days");

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
    <Box sx={pageWrapper}>
      <Box sx={overviewHeader}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Company Admin dashboard
        </Typography>
        <Box sx={overviewHeaderDropdownWrap}>
          <Dropdown
            id="date-range-menu-employee"
            options={DATE_RANGE_OPTIONS}
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
          value="23,0989"
          subtitle="Across 8 child companies"
          icon={<BarChartIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentBlue}
          valueColor={theme.app.dashboard.accentBlue}
          subtitleColor={theme.app.dashboard.white95}
          showTrendArrow={false}
        />
        <MetricCard
          title="Active Chats"
          value="89"
          subtitle="Peak time currently"
          icon={<BarChartIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentOrange}
          valueColor={theme.app.dashboard.accentOrange}
          subtitleColor={theme.app.dashboard.white95}
        />
        <MetricCard
          title="Avg Response Time"
          value="1m 24s"
          subtitle="Improved from last week"
          icon={<BarChartIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentPurple}
          valueColor={theme.app.dashboard.accentPurple}
          subtitleColor={theme.app.dashboard.white95}
        />
        <MetricCard
          title="QA Average Rating"
          value="4.8/5.0"
          subtitle="52% increase from last month"
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
            <SegmentedControl
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "weekly", label: "Weekly" },
              ]}
              value="monthly"
              onChange={() => {}}
              variant="default"
            />
          </Box>
          <Box sx={chartFlexFill}>
            <Box sx={chartBoxDepartmentPerformance}>
              <ChatAnalyticsBarChart
                data={departmentPerformanceBarData}
                height={320}
                yDomain={[0, 80]}
                yTickFormatter={(v) => String(v)}
                tooltipFormatter={(v) => String(v)}
              />
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
              <ChatVolumeChart
                data={chatVolumeLineData}
                height={220}
                yDomain={[50, 200]}
                yTickFormatter={(v) => String(v)}
                tooltipFormatter={(v) => String(v)}
              />
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
                    23,545
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
                    2,401
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
            <DataTable<AgentPerformanceRow>
              columns={agentPerformanceColumns}
              rows={agentPerformanceRows}
              getRowId={(row, idx) => `agent-${row.agentName}-${idx}`}
              minWidth={560}
            />
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
                  12
                </Typography>
                <Typography component="span" variant="mediumLarge">
                  Chats
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" sx={liveOverviewRefreshButton}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </DashboardCard>
          <Typography variant="subtitle1" sx={liveOverviewSectionTitle}>
            Currently Active (Recent)
          </Typography>
          <Box sx={liveOverviewChatList}>
            {liveOverviewChats.map((chat, idx) => (
              <Box key={`${chat.name}-${idx}`} sx={liveOverviewChatRow}>
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
            ))}
          </Box>
        </DashboardCard>
      </Box>
    </Box>
  );
}
