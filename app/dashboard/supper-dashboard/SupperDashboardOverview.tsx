"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
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
import { MetricCard } from "@/components/dashboard";
import { ChatsByDepartmentIcon } from "@/components/dashboard/icons/ChatsByDepartmentIcon";
import { userIconPath } from "@/assets";
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

const DATE_RANGE_OPTIONS = ["Last 7 Days", "Last 30 Days", "Last 90 Days"];

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

export default function SupperDashboardOverview() {
  const theme = useTheme() as AppTheme;
  const [dateRangeValue, setDateRangeValue] = useState("Last 30 Days");
  const [activityPage, setActivityPage] = useState(1);
  const activityPageCount = 2;

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

  return (
    <Box sx={pageWrapper}>
      <Box sx={overviewHeader}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          supper dashboard
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
              value="7days"
              onChange={() => {}}
              variant="default"
            />
          </Box>
          <Box sx={chartFlexFill}>
            <Box sx={chartBox260}>
              <ChatAnalyticsBarChart data={chatAnalyticsData} />
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
              <DepartmentPieChart data={departmentData} />
            </Box>
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
          <Typography variant="subtitle1" fontWeight={600} color="white">
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
