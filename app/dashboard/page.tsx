"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import IconButton from "@mui/material/IconButton";
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
  BarChart as BarChartIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { MetricCard } from "@/components/dashboard";
import { ChatsByDepartmentIcon } from "@/components/dashboard/icons/ChatsByDepartmentIcon";
import { userIconPath } from "@/assets";
import { useAuth } from "@/lib/auth/AuthContext";
import { DashboardCard, Dropdown, SegmentedControl, DataTable, dataTableActionButton, TablePagination } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import {
  pageWrapper,
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
  chatVolumeIconBox,
  chartBox220,
  chartBox260,
  chartBox280,
  chartBoxDepartmentPerformance,
  iconSize22,
  chatVolumeSummaryPanel,
  chatVolumeSummaryItem,
  chatVolumeSummaryDivider,
  liveOverviewHeaderIconBox,
  liveOverviewWaitingCard,
  liveOverviewSectionTitle,
  liveOverviewChatRow,
  overviewHeaderDropdownWrap,
  chartLoadingBox,
  chartLoadingBox260,
  chartLoadingBox280,
  tableUserCellBox,
  tableAvatar,
  tableAvatarIcon,
  activeChatsPill,
  avgRatingBox,
  starIconYellow,
  chatVolumeSummaryWrapper,
  chatVolumeSummaryLabel,
  chatVolumeResolvedColor,
  gridAgentLiveOverview,
  cardAgentPerformance,
  cardLiveOverview,
  liveOverviewIconSize,
  waitingQueueLabel,
  waitingQueueCountRow,
  liveOverviewRefreshButton,
  liveOverviewChatList,
  liveOverviewAvatar,
  liveOverviewAvatarIcon,
  liveOverviewChatContent,
  liveOverviewChatName,
  liveOverviewChatMessage,
  liveOverviewChatTime,
  revenueTitleRowMb2,
  revenueIconSmall,
} from "./dashboard.styles";
const RevenueLineChart = dynamic(
  () => import("@/components/common/Charts").then((m) => ({ default: m.RevenueLineChart })),
  { ssr: false, loading: () => <Box sx={chartLoadingBox} /> }
);

const ChatAnalyticsBarChart = dynamic(
  () => import("@/components/common/Charts").then((m) => ({ default: m.ChatAnalyticsBarChart })),
  { ssr: false, loading: () => <Box sx={chartLoadingBox260} /> }
);

const ChatVolumeChart = dynamic(
  () => import("@/components/common/Charts").then((m) => ({ default: m.ChatVolumeChart })),
  { ssr: false, loading: () => <Box sx={chartLoadingBox} /> }
);

const DepartmentPieChart = dynamic(
  () => import("@/components/common/Charts").then((m) => ({ default: m.DepartmentPieChart })),
  { ssr: false, loading: () => <Box sx={chartLoadingBox280} /> }
);

const revenueData = [
  { day: 1, value: 142, value2: 158 },
  { day: 2, value: 168, value2: 152 },
  { day: 3, value: 155, value2: 165 },
  { day: 4, value: 178, value2: 148 },
  { day: 5, value: 192, value2: 172 },
  { day: 6, value: 185, value2: 188 },
  { day: 7, value: 198, value2: 178 },
  { day: 8, value: 212, value2: 195 },
  { day: 9, value: 205, value2: 202 },
  { day: 10, value: 218, value2: 192 },
  { day: 11, value: 228, value2: 208 },
  { day: 12, value: 222, value2: 215 },
  { day: 13, value: 238, value2: 205 },
  { day: 14, value: 245, value2: 225 },
  { day: 15, value: 252, value2: 232 },
  { day: 16, value: 248, value2: 242 },
  { day: 17, value: 255, value2: 238 },
  { day: 18, value: 248, value2: 248 },
  { day: 19, value: 242, value2: 252 },
  { day: 20, value: 235, value2: 245 },
  { day: 21, value: 228, value2: 238 },
  { day: 22, value: 232, value2: 232 },
  { day: 23, value: 225, value2: 228 },
  { day: 24, value: 218, value2: 222 },
  { day: 25, value: 235, value2: 238 },
  { day: 26, value: 242, value2: 245 },
  { day: 27, value: 248, value2: 252 },
  { day: 28, value: 255, value2: 248 },
  { day: 29, value: 252, value2: 255 },
  { day: 30, value: 258, value2: 248 },
];

const chatAnalyticsData = [
  { name: "Mon", value: 185000, fill: "first" as const },
  { name: "Tue", value: 160000, fill: "second" as const },
  { name: "Wed", value: 180000, fill: "first" as const },
  { name: "Thu", value: 225000, fill: "second" as const },
  { name: "Fri", value: 270000, fill: "second" as const },
  { name: "Sat", value: 280000, fill: "first" as const },
  { name: "Sun", value: 170000, fill: "second" as const },
];

const departmentData = [
  { name: "Support", value: 15, color: "#F97316" },
  { name: "Billing", value: 25, color: "#3B82F6" },
  { name: "Sales", value: 20, color: "#EC4899" },
  { name: "Marketing", value: 35, color: "#6366F1" },
];

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
  { agentName: "Sarah Jenkins", activeChats: 2, closedToday: 10982, avgRating: 4.5, avgResponse: "45s" },
  { agentName: "Mike Ross", activeChats: 0, closedToday: 82, avgRating: 5.0, avgResponse: "1m 12s" },
  { agentName: "Emily Chen", activeChats: 7, closedToday: 982, avgRating: 4.2, avgResponse: "58s" },
  { agentName: "David Kim", activeChats: 2, closedToday: 2, avgRating: 4.9, avgResponse: "1m 05s" },
  { agentName: "Sarah Jenkins", activeChats: 4, closedToday: 1231, avgRating: 3.9, avgResponse: "18s" },
  { agentName: "Mike Ross", activeChats: 7, closedToday: 0, avgRating: 5.0, avgResponse: "2m 05s" },
];

const liveOverviewChats = [
  { name: "Courtney Henry", message: "I need help with my subscription upgrade...", time: "2m ago" },
  { name: "Robert Fox", message: "Is there a discount for annual plans?", time: "1m ago" },
  { name: "John Smith", message: "Connecting to agent...", time: "12m ago" },
];

const activityLog = [
  { activityType: "New User Created", user: "Counterparty", module: "Organization", date: "02.02.26", time: "11:42 AM" },
  { activityType: "Rule updated", user: "Admin", module: "AI", date: "02.02.26", time: "10:15 AM" },
  { activityType: "Department Created", user: "Counterparty", module: "Organization", date: "01.02.26", time: "04:20 PM" },
  { activityType: "Amount Received", user: "Finance", module: "Billing", date: "01.02.26", time: "02:30 PM" },
];

interface ActivityLogRow extends Record<string, unknown> {
  activityType: string;
  user: string;
  module: string;
  date: string;
  time: string;
  userImage?: string;
}

interface AgentPerformanceRow extends Record<string, unknown> {
  agentName: string;
  activeChats: number;
  closedToday: number;
  avgRating: number;
  avgResponse: string;
}

const DATE_RANGE_OPTIONS = ["Last 7 Days", "Last 30 Days", "Last 90 Days"];

export default function DashboardPage() {
  const theme = useTheme() as AppTheme;
  const [dateRangeValue, setDateRangeValue] = useState("Last 30 Days");
  const [activityPage, setActivityPage] = useState(1);
  const activityPageCount = 2;
  const { user } = useAuth();

  const activityColumns = useMemo<DataTableColumn<ActivityLogRow>[]>(
    () => [
      { id: "activityType", label: "Activity Type" },
      {
        id: "user",
        label: "User",
        render: (_, row) => {
          const name = String(row.user ?? "");
          const hasImage = typeof (row as { userImage?: string }).userImage === "string";
          const userImage = (row as { userImage?: string }).userImage;
          return (
            <Box sx={tableUserCellBox}>
              <Avatar src={hasImage ? userImage : userIconPath} sx={tableAvatar}>
                {!hasImage && <PersonIcon sx={tableAvatarIcon} />}
              </Avatar>
              <Typography component="span" variant="body2" color="textPrimary" fontWeight={500}>
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
    []
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
            <Typography component="span" variant="body2" color="textPrimary" fontWeight={500}>
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
            <Typography component="span" variant="body2" color="textPrimary">
              {row.avgRating}
            </Typography>
          </Box>
        ),
      },
      { id: "avgResponse", label: "Avg Response", cellVariant: "muted" },
    ],
    []
  );

  const isEmployee = user?.role === "user";

  if (isEmployee) {
    return (
      <Box sx={pageWrapper}>
        <Box sx={overviewHeader}>
          <Typography variant="regularLarge" fontWeight={700} color="textPrimary">
            Overview
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
            showTrendArrow={false}
          />
          <MetricCard
            title="Active Chats"
            value="89"
            subtitle="Peak time currently"
            icon={<BarChartIcon sx={iconSize22} />}
            iconBgColor={theme.app.dashboard.accentOrange}
            valueColor={theme.app.dashboard.accentOrange}
          />
          <MetricCard
            title="Avg Response Time"
            value="1m 24s"
            subtitle="Improved from last week"
            icon={<BarChartIcon sx={iconSize22} />}
            iconBgColor={theme.app.dashboard.accentPurple}
            valueColor={theme.app.dashboard.accentPurple}
          />
          <MetricCard
            title="QA Average Rating"
            value="4.8/5.0"
            subtitle="52% increase from last month"
            icon={<BarChartIcon sx={iconSize22} />}
            iconBgColor={theme.app.dashboard.accentPink}
            valueColor={theme.app.dashboard.accentPink}
          />
        </Box>

        <Box sx={grid2Lg}>
          <DashboardCard sx={cardPadding}>
            <Box sx={revenueHeaderRow}>
              <Box sx={revenueTitleRow}>
                <Box sx={chatAnalyticsIconBox}>
                  <PersonIcon sx={iconSize22} />
                </Box>
                <Typography variant="subtitle1" fontWeight={600} color="textPrimary">
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
            <Box sx={chartBoxDepartmentPerformance}>
              <ChatAnalyticsBarChart
                data={departmentPerformanceBarData}
                height={320}
                yDomain={[0, 80]}
                yTickFormatter={(v) => String(v)}
                tooltipFormatter={(v) => String(v)}
              />
            </Box>
          </DashboardCard>
          <DashboardCard sx={cardPadding}>
            <Box sx={revenueHeaderRow}>
              <Box sx={revenueTitleRow}>
                <Box sx={chatVolumeIconBox}>
                  <ChatIcon sx={iconSize22} />
                </Box>
                <Typography variant="subtitle1" fontWeight={600} color="textPrimary">
                  Chat Volume
                </Typography>
              </Box>
            </Box>
            <Box sx={chartBox220}>
              <ChatVolumeChart
                data={chatVolumeLineData}
                height={220}
                yDomain={[50, 200]}
                yTickFormatter={(v) => String(v)}
                tooltipFormatter={(v) => String(v)}
              />
            <Box sx={chatVolumeSummaryWrapper}>
              <DashboardCard sx={chatVolumeSummaryPanel}>
                <Box sx={chatVolumeSummaryItem}>
                  <Typography variant="medium16" sx={{ color: theme.app.dashboard.white7, ...chatVolumeSummaryLabel } as object}>
                    Total Chats
                  </Typography>
                  <Typography variant="medium16" color="textPrimary">
                    23,545
                  </Typography>
                </Box>
                <Box sx={chatVolumeSummaryDivider} />
                <Box sx={chatVolumeSummaryItem}>
                  <Typography variant="medium16" sx={{ color: theme.app.dashboard.white7, ...chatVolumeSummaryLabel } as object}>
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
              <Typography variant="subtitle1" fontWeight={600} color="textPrimary">
                Agent Performance
              </Typography>
            </Box>
            <DataTable<AgentPerformanceRow>
              columns={agentPerformanceColumns}
              rows={agentPerformanceRows}
              getRowId={(row, idx) => `agent-${row.agentName}-${idx}`}
              minWidth={560}
            />
          </DashboardCard>
          <DashboardCard sx={cardLiveOverview}>
            <Box sx={revenueTitleRowMb2}>
              <Box sx={liveOverviewHeaderIconBox}>
                <AttachMoneyIcon sx={liveOverviewIconSize} />
              </Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: theme.app.dashboard.white95 }}>
                Live Overview
              </Typography>
            </Box>
            <DashboardCard sx={liveOverviewWaitingCard}>
              <Box>
                <Typography variant="body2" sx={{ color: theme.app.dashboard.white65, ...waitingQueueLabel } as object}>
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
                    <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.dashboard.white95, ...liveOverviewChatName } as object}>
                      {chat.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.app.dashboard.white60, ...liveOverviewChatMessage } as object}>
                      {chat.message}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: theme.app.dashboard.white60, ...liveOverviewChatTime } as object}>
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

  return (
    <Box sx={pageWrapper}>
      <Box sx={overviewHeader}>
        <Typography variant="regularLarge" fontWeight={700} color="textPrimary">
          Overview
        </Typography>
        <Box sx={overviewHeaderDropdownWrap}>
            <Dropdown
              id="date-range-menu"
            options={DATE_RANGE_OPTIONS}
            value={dateRangeValue}
            onChange={setDateRangeValue}
            buttonSx={last30DaysButton}
            endIcon="▾"
          />
        </Box>
      </Box>

      <Box sx={grid3}>
        <MetricCard
          title="Today Total Chats"
          value="0989"
          subtitle="10% increase from last month"
          icon={<ChatIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentBlue}
        />
        <MetricCard
          title="Total Companies"
          value="123"
          subtitle="10% increase from last month"
          icon={<BusinessIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentOrange}
        />
        <MetricCard
          title="Total Active Websites"
          value="32"
          subtitle="10% increase from last month"
          icon={<PublicIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentBlue}
        />
      </Box>

      <Box sx={grid3}>
        <MetricCard
          title="Total Active Users"
          value="1,243,412"
          subtitle="10% increase from last month"
          icon={<PeopleIcon sx={iconSize22} />}
          iconBgColor="#A855F7"
        />
        <MetricCard
          title="Live Chat"
          value="122"
          subtitle="10% increase from last month"
          icon={<HeadsetIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentPink}
        />
        <MetricCard
          title="Today Total Chats"
          value="1234"
          subtitle="10% increase from last month"
          icon={<ChatIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentBlue}
        />
      </Box>

      <Box sx={grid3Lg}>
        <Box sx={revenueCardsColumn}>
          <MetricCard
            title="Monthly Revenue"
            value="$34,008,327"
            subtitle="10% increase from last month"
            icon={<AttachMoneyIcon sx={iconSize22} />}
            iconBgColor={theme.app.dashboard.accentPink}
          />
          <MetricCard
            title="Today Revenue"
            value="$323,971.32"
            subtitle="10% increase from last month"
            icon={<AttachMoneyIcon sx={iconSize22} />}
            iconBgColor={theme.app.dashboard.accentBlue}
          />
        </Box>
        <DashboardCard sx={cardPadding}>
          <Box sx={revenueHeaderRow}>
            <Box sx={revenueTitleRow}>
              <Box sx={revenueIconBox}>
                <AttachMoneyIcon sx={revenueIconSmall} />
              </Box>
              <Typography variant="subtitle1" fontWeight={600} color="textPrimary">
                Revenue Overview
              </Typography>
            </Box>
            <SegmentedControl
              options={[
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
                { value: "today", label: "Today's" },
              ]}
              value="monthly"
              onChange={() => {}}
              variant="default"
            />
          </Box>
          <Box sx={chartBox220}>
            <RevenueLineChart data={revenueData} />
          </Box>
        </DashboardCard>
      </Box>

      <Box sx={grid2Lg}>
        <DashboardCard sx={cardPadding}>
          <Box sx={revenueHeaderRow}>
            <Box sx={revenueTitleRow}>
              <Box sx={chatAnalyticsIconBox}>
                <ChatIcon sx={iconSize22} />
              </Box>
              <Typography variant="subtitle1" fontWeight={600} color="textPrimary">
                Chat Analytics
              </Typography>
            </Box>
            <SegmentedControl
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "7days", label: "last 7 Days" },
              ]}
              value="7days"
              onChange={() => {}}
              variant="default"
            />
          </Box>
          <Box sx={chartBox260}>
            <ChatAnalyticsBarChart data={chatAnalyticsData} />
          </Box>
        </DashboardCard>
        <DashboardCard sx={cardPadding}>
          <Box sx={revenueTitleRowMb2}>
            <ChatsByDepartmentIcon />
            <Typography variant="subtitle1" fontWeight={600} color="textPrimary">
              Chats by Department
            </Typography>
          </Box>
          <Box sx={chartBox280}>
            <DepartmentPieChart data={departmentData} />
          </Box>
        </DashboardCard>
      </Box>

      <Box sx={grid4}>
        <MetricCard
          title="Agents Online"
          value="123/870"
          subtitle="10% increase from last month"
          icon={<PersonIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentBlue}
        />
        <MetricCard
          title="License Expiring"
          value="07"
          subtitle="License Expired"
          icon={<WarningIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentRed}
          subtitleColor={theme.app.dashboard.accentRed}
          showTrendArrow={false}
        />
        <MetricCard
          title="Reached PA"
          value="$323,971.32"
          subtitle="10% increase from last month"
          icon={<AttachMoneyIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentBlue}
        />
        <MetricCard
          title="System Status"
          value="Operational"
          subtitle="No Issues"
          icon={<CheckCircleIcon sx={iconSize22} />}
          iconBgColor={theme.app.dashboard.accentBlue}
        />
      </Box>

      <DashboardCard sx={cardPaddingAutoHeight}>
        <Box sx={revenueTitleRowMb2}>
          <Box sx={chatAnalyticsIconBox}>
            <ListIcon sx={iconSize22} />
          </Box>
          <Typography variant="subtitle1" fontWeight={600} color="textPrimary">
            Recent Activity Log
          </Typography>
        </Box>
        <DataTable<ActivityLogRow>
          columns={activityColumns}
          rows={activityLog}
          getRowId={(row) => `${row.activityType}-${row.date}-${row.time}`}
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
    </Box>
  );
}
