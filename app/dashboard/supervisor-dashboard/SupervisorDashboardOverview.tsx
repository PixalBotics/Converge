"use client";

import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Typography,
  DashboardCard,
  Dropdown,
  Button,
  DataTable,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { MetricCard } from "@/components/layout/dashboard";
import {
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  BarChart as BarChartIcon,
  Star as StarIcon,
  ChatBubble as ChatBubbleIcon,
  ArrowForward as ArrowForwardIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { userIconPath } from "@/assets";
import {
  pageWrapper,
  overviewHeader,
  last30DaysButton,
  grid4,
  overviewHeaderDropdownWrap,
  cardPadding,
  revenueTitleRow,
  tableUserCellBox,
  tableAvatar,
  tableAvatarIcon,
  starIconYellow,
  gridAgentLiveOverviewHr,
  cardAgentPerformance,
  cardLiveOverview,
  getViewAllAgentLink,
  viewAllAgentWrap,
  agentLiveHeaderRow,
  qaHeaderRow,
  qaHeaderIconCircle,
  departmentRatingCard,
  departmentRatingRow,
  trendArrowBox,
  ratingValueBox,
  getRatingValuePurple,
  excellentPoorGrid,
  excellentPoorCard,
  starExcellent,
  getStarPoor,
  getRatingNumberBlue,
  trendRow,
  reviewPowerButton,
  liveMonitorHeaderRow,
  getMonitorAllButton,
  liveChatGrid,
  getLiveChatCard,
  liveChatTopRow,
  liveChatCustomerBlock,
  getLiveChatAvatar,
  liveChatCustomerName,
  getLiveChatDivider,
  liveChatAssignedBlock,
  getLiveChatMessageBlock,
  getLiveChatMessageText,
  getLiveChatBottomRow,
  liveChatStatusGroup,
  liveChatStatusItem,
  liveChatStatusDot,
  getQuickViewLink,
  activeChatBarsRoot,
  activeChatBarsLabel,
  statusCell,
} from "./SupervisorDashboardOverview.styles";

const DATE_RANGE_OPTIONS = ["Last 7 Days", "Last 30 Days", "Last 90 Days"];

const AGENT_ROWS = [
  { name: "Sarah Jenkins", status: "Online", statusColor: "#22C55E", activeChats: 3, avgResponse: "45s" },
  { name: "Mike Ross", status: "Busy", statusColor: "#F97316", activeChats: 2, avgResponse: "1m 08s" },
  { name: "Emily Chen", status: "Online", statusColor: "#22C55E", activeChats: 1, avgResponse: "-" },
  { name: "David Kim", status: "Offline", statusColor: "#EF4444", activeChats: 0, avgResponse: "2m 09s" },
  { name: "Alex Morgan", status: "Online", statusColor: "#22C55E", activeChats: 2, avgResponse: "58s" },
  { name: "Jordan Lee", status: "Busy", statusColor: "#F97316", activeChats: 4, avgResponse: "1m 22s" },
];

const LIVE_CHATS = [
  { customer: "Kristin", customerId: "2847", agent: "Sarah J.", messages: 8, duration: "4m 12s", status: "Active", statusColor: "#22C55E" },
  { customer: "Robert", customerId: "2848", agent: "Mike R.", messages: 5, duration: "2m 45s", status: "Busy", statusColor: "#F97316" },
  { customer: "Amanda", customerId: "2849", agent: "Emily C.", messages: 12, duration: "6m 00s", status: "Active", statusColor: "#22C55E" },
  { customer: "James", customerId: "2850", agent: "David K.", messages: 3, duration: "1m 30s", status: "Waiting", statusColor: "#EF4444" },
  { customer: "Lisa", customerId: "2851", agent: "Alex M.", messages: 7, duration: "3m 55s", status: "Active", statusColor: "#22C55E" },
  { customer: "Chris", customerId: "2852", agent: "Jordan L.", messages: 9, duration: "5m 18s", status: "Busy", statusColor: "#F97316" },
];

type AgentRow = {
  name: string;
  status: string;
  statusColor: string;
  activeChats: number;
  avgResponse: string;
};

function ActiveChatBars({ count, theme }: { count: number; theme: AppTheme }) {
  const total = 5;
  return (
    <Box sx={activeChatBarsRoot}>
      <Typography variant="body2" color="white" sx={activeChatBarsLabel}>
        {String(count).padStart(2, "0")}
      </Typography>
      {Array.from({ length: total }).map((_, i) => (
        <Box
          key={i}
          sx={{
            width: 8,
            height: 16,
            borderRadius: 1,
            bgcolor:
              i < count
                ? count >= 3
                  ? theme.app.dashboard.accentGreen
                  : theme.app.dashboard.accentOrange
                : theme.app.dashboard.overlayMedium,
          }}
        />
      ))}
    </Box>
  );
}

export default function SupervisorDashboardOverview() {
  const theme = useTheme() as AppTheme;
  const [dateRangeValue, setDateRangeValue] = useState("Last 30 Days");

  const agentColumns = useMemo<DataTableColumn<AgentRow>[]>(
    () => [
      {
        id: "name",
        label: "Agent Name",
        render: (_, row) => (
          <Box sx={tableUserCellBox}>
            <Avatar src={userIconPath} sx={tableAvatar}>
              <PersonIcon sx={tableAvatarIcon} />
            </Avatar>
            <Typography variant="body2" fontWeight={500} color="white">
              {row.name}
            </Typography>
          </Box>
        ),
      },
      {
        id: "status",
        label: "Status",
        render: (_, row) => (
          <Box sx={statusCell}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: row.statusColor }} />
            <Typography variant="body2" color="white">
              {row.status}
            </Typography>
          </Box>
        ),
      },
      {
        id: "activeChats",
        label: "Active Chats",
        render: (_, row) => <ActiveChatBars count={row.activeChats} theme={theme} />,
      },
      { id: "avgResponse", label: "Avg Response", cellVariant: "muted" },
    ],
    [theme],
  );

  return (
    <Box sx={pageWrapper}>
      <Box sx={overviewHeader}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          supervisor dashboard
        </Typography>
        <Box sx={overviewHeaderDropdownWrap}>
          <Dropdown
            id="date-range-hr-admin"
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
          title="Agents Online"
          value="23,0989"
          subtitle="7 Out of 35 total agents"
          icon={<BarChartIcon sx={{ fontSize: 22 }} />}
          iconBgColor={theme.app.dashboard.accentBlue}
          valueColor={theme.app.dashboard.accentCyan}
          showTrendArrow={true}
        />
        <MetricCard
          title="Chats in Progress"
          value="89"
          subtitle="7 Average 2.3 per agent"
          icon={<BarChartIcon sx={{ fontSize: 22 }} />}
          iconBgColor={theme.app.dashboard.accentPurple}
          valueColor={theme.app.dashboard.accentCyan}
          showTrendArrow={true}
        />
        <MetricCard
          title="Chats Waiting"
          value="1m 24s"
          subtitle="7 Longest wait: 3m 12s"
          icon={<BarChartIcon sx={{ fontSize: 22 }} />}
          iconBgColor={theme.app.dashboard.accentPurple}
          valueColor={theme.app.dashboard.accentCyan}
          showTrendArrow={true}
        />
        <MetricCard
          title="Escalated Chats"
          value="4 Critical"
          subtitle="7 Requires immediate attention"
          icon={<BarChartIcon sx={{ fontSize: 22 }} />}
          iconBgColor={theme.app.dashboard.accentRed}
          valueColor={theme.app.dashboard.accentRedLight}
          subtitleColor={theme.app.dashboard.accentRedLight}
          showTrendArrow={true}
        />
      </Box>

      <Box sx={gridAgentLiveOverviewHr}>
        <DashboardCard sx={cardAgentPerformance}>
          <Box sx={agentLiveHeaderRow}>
            <Box sx={revenueTitleRow}>
              <Box sx={qaHeaderIconCircle}>
                <AttachMoneyIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="subtitle1" fontWeight={600} color="white">
                Agent Live Status
              </Typography>
            </Box>
          </Box>
          <DataTable<AgentRow> columns={agentColumns} rows={AGENT_ROWS} size="small" />
          <Box sx={viewAllAgentWrap}>
            <Box component="a" href="#" sx={getViewAllAgentLink(theme)}>
              View All Agent (23)
              <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </DashboardCard>

        <DashboardCard sx={cardLiveOverview}>
          <Box sx={qaHeaderRow}>
            <Box sx={revenueTitleRow}>
              <Box sx={qaHeaderIconCircle}>
                <AttachMoneyIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="subtitle1" fontWeight={600} color="white">
                QA Snapshot
              </Typography>
            </Box>
          </Box>
          <DashboardCard sx={departmentRatingCard}>
            <Box sx={departmentRatingRow}>
              <Box>
                <Typography variant="body2" color="white" fontWeight={500} sx={{ mb: 0.5 }}>
                  Department Rating
                </Typography>
                <Box sx={trendRow}>
                  <Box component="span" sx={trendArrowBox}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M6 9V3M6 3L3 6M6 3L9 6"
                        stroke="#22C55E"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Box>
                  <Typography variant="caption" color="rgba(255,255,255,0.6)">
                    Last 24 Hours
                  </Typography>
                </Box>
              </Box>
              <Box sx={ratingValueBox}>
                <StarIcon sx={starIconYellow} />
                <Typography variant="h6" fontWeight={700} sx={getRatingValuePurple(theme)}>
                  4.9
                </Typography>
              </Box>
            </Box>
          </DashboardCard>
          <Box sx={excellentPoorGrid}>
            <DashboardCard sx={excellentPoorCard}>
              <StarIcon sx={starExcellent} />
              <Typography variant="body2" fontWeight={600} color="white">
                Excellent
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={getRatingNumberBlue(theme)}>
                156
              </Typography>
              <Box sx={trendRow}>
                <Box component="span" sx={{ display: "inline-flex", alignItems: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 9V3M6 3L3 6M6 3L9 6"
                      stroke="#22C55E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Box>
                <Typography variant="caption" color="rgba(255,255,255,0.6)">
                  5-star Ratings
                </Typography>
              </Box>
            </DashboardCard>
            <DashboardCard sx={excellentPoorCard}>
              <StarIcon sx={getStarPoor(theme)} />
              <Typography variant="body2" fontWeight={600} color="white">
                Poor
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={getRatingNumberBlue(theme)}>
                156
              </Typography>
              <Box sx={trendRow}>
                <Box component="span" sx={{ display: "inline-flex", alignItems: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 3V9M6 9L3 6M6 9L9 6"
                      stroke="#EF4444"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Box>
                <Typography variant="caption" color="rgba(255,255,255,0.6)">
                  1-star Ratings
                </Typography>
              </Box>
            </DashboardCard>
          </Box>
          <Button
            variant="primary"
            fullWidth
            sx={{
              ...reviewPowerButton,
              bgcolor: theme.palette.primary.main,
              "&:hover": { bgcolor: theme.palette.primary.dark },
            }}
          >
            Review Power Rating
          </Button>
        </DashboardCard>
      </Box>

      <DashboardCard sx={cardPadding}>
        <Box sx={liveMonitorHeaderRow}>
          <Box sx={revenueTitleRow}>
            <Box sx={qaHeaderIconCircle}>
              <AttachMoneyIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography variant="subtitle1" fontWeight={600} color="white">
              Live Chat Monitor
            </Typography>
          </Box>
          <Button variant="outlined" sx={getMonitorAllButton(theme)}>
            Monitor All
          </Button>
        </Box>
        <Box sx={liveChatGrid}>
          {LIVE_CHATS.map((chat, idx) => (
            <Box key={idx} sx={getLiveChatCard(theme)}>
              <Box sx={liveChatTopRow}>
                <Box sx={liveChatCustomerBlock}>
                  <Avatar sx={getLiveChatAvatar(theme)}>
                    <PersonIcon sx={{ fontSize: 22 }} />
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      color="white"
                      sx={liveChatCustomerName}
                    >
                      {chat.customer}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.app.dashboard.white60 }}>
                      Customer ID: #{chat.customerId}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={getLiveChatDivider(theme)} />
                <Box sx={liveChatAssignedBlock}>
                  <Avatar sx={getLiveChatAvatar(theme)}>
                    <PersonIcon sx={{ fontSize: 22 }} />
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" color="white" fontWeight={500}>
                      Assigned to
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.app.dashboard.white7 }}>
                      {chat.agent}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={getLiveChatMessageBlock(theme)}>
                <Typography variant="caption" sx={getLiveChatMessageText(theme)}>
                  Can you help me upgrade my subscription plan to Pro? Can you help me
                  upgrade my subscription plan to Pro? help me upgrade my subscription
                  plan to Pro?
                </Typography>
              </Box>
              <Box sx={getLiveChatBottomRow(theme)}>
                <Box sx={liveChatStatusGroup}>
                  <Box sx={liveChatStatusItem}>
                    <ChatBubbleIcon sx={{ fontSize: 16, color: "white" }} />
                    <Typography variant="caption" color="white">
                      {chat.messages} Msgs
                    </Typography>
                  </Box>
                  <Box sx={liveChatStatusItem}>
                    <AccessTimeIcon sx={{ fontSize: 16, color: "white" }} />
                    <Typography variant="caption" color="white">
                      {chat.duration}
                    </Typography>
                  </Box>
                  <Box sx={liveChatStatusItem}>
                    <Box sx={{ ...liveChatStatusDot, bgcolor: chat.statusColor }} />
                    <Typography variant="caption" color="white">
                      {chat.status}
                    </Typography>
                  </Box>
                </Box>
                <Box component="a" href="#" sx={getQuickViewLink(theme)}>
                  Quick View
                  <ArrowForwardIcon sx={{ fontSize: 14 }} />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </DashboardCard>
    </Box>
  );
}
