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
import { MetricCard } from "@/components/common";
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
import { dashboardEmbeddedOverviewRoot, embeddedOverviewToolbar } from "../dashboard.styles";
import { WebsiteTrafficSummarySection } from "@/features/chat-shared/components/WebsiteTrafficSummarySection";
import { SupervisorDashboardBlockLayout } from "./SupervisorDashboardBlockLayout";
import { formatDurationSeconds, formatScore } from "@/features/chat-reports/utils/format-metric";
import {
  conversationVisitorName,
  DASHBOARD_DATE_RANGE_OPTIONS,
  elapsedDurationLabel,
  formatDashboardCount,
  lastMessagePreview,
  monitorAgentDisplayName,
  shortConversationId,
} from "../components/dashboard-chat.utils";
import {
  agentDirectoryStatus,
  useDashboardChatReports,
  useDashboardMonitorSnapshot,
} from "../components/use-dashboard-chat-data";

type AgentRow = {
  id: string;
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

export default function SupervisorDashboardOverview({ embedded = false }: { embedded?: boolean }) {
  const theme = useTheme() as AppTheme;
  const [dateRangeValue, setDateRangeValue] = useState("Last 30 Days");
  const reports = useDashboardChatReports(dateRangeValue);
  const monitor = useDashboardMonitorSnapshot();

  const metricsLoading = reports.loading || monitor.loading;
  const responseByAgent = useMemo(
    () =>
      new Map(
        (reports.overview?.byAgent ?? []).map((bucket) => [
          bucket.key,
          bucket.avgFirstResponseSeconds,
        ]),
      ),
    [reports.overview?.byAgent],
  );

  const agentRows = useMemo<AgentRow[]>(() => {
    return monitor.roster.slice(0, 8).map((agent) => {
      const status = agentDirectoryStatus(agent);
      return {
        id: agent.userId,
        name: agent.displayName,
        status: status.status,
        statusColor: status.statusColor,
        activeChats: agent.liveCount,
        avgResponse: formatDurationSeconds(responseByAgent.get(agent.userId) ?? null),
      };
    });
  }, [monitor.roster, responseByAgent]);

  const liveChats = useMemo(
    () =>
      monitor.liveList.slice(0, 6).map((chat) => {
        const status = (chat.status ?? "active").replace(/_/g, " ");
        const normalized = status.toLowerCase();
        const statusColor =
          normalized === "waiting"
            ? "#EF4444"
            : normalized === "assigned" || normalized === "active"
              ? "#22C55E"
              : "#F97316";
        return {
          id: chat.id,
          customer: conversationVisitorName(chat),
          customerId: shortConversationId(chat.id).replace("#", ""),
          agent: monitorAgentDisplayName(chat.agent),
          messages: "—",
          duration: elapsedDurationLabel(chat.startedAt),
          status: status.charAt(0).toUpperCase() + status.slice(1),
          statusColor,
          message: lastMessagePreview(chat),
        };
      }),
    [monitor.liveList],
  );

  const avgPerAgent =
    monitor.agentsOnline > 0
      ? (monitor.inProgress / monitor.agentsOnline).toFixed(1)
      : "0";

  const qaSummary = reports.qaQuality?.summary;
  const excellentCount = useMemo(
    () =>
      (reports.qaQuality?.byAgent ?? []).reduce(
        (sum, row) => sum + (row.avgScore != null && row.avgScore >= 8 ? row.reviewCount : 0),
        0,
      ),
    [reports.qaQuality?.byAgent],
  );
  const poorCount = useMemo(
    () =>
      (reports.qaQuality?.byAgent ?? []).reduce((sum, row) => sum + row.lowScoreCount, 0),
    [reports.qaQuality?.byAgent],
  );

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
    <Box sx={embedded ? dashboardEmbeddedOverviewRoot : pageWrapper}>
      <Box sx={embedded ? embeddedOverviewToolbar : overviewHeader}>
        {!embedded ? (
          <Typography variant="regularLarge" fontWeight={700} color="white">
            supervisor dashboard
          </Typography>
        ) : null}
        <Box sx={overviewHeaderDropdownWrap}>
          <Dropdown
            id="date-range-hr-admin"
            options={[...DASHBOARD_DATE_RANGE_OPTIONS]}
            value={dateRangeValue}
            onChange={setDateRangeValue}
            buttonSx={last30DaysButton}
            endIcon="▾"
          />
        </Box>
      </Box>

      <SupervisorDashboardBlockLayout
        liveMetrics={
          <Box sx={grid4}>
        <MetricCard
          title="Agents Online"
          value={formatDashboardCount(monitor.agentsOnline, metricsLoading)}
          subtitle={`${formatDashboardCount(monitor.agentsTotal, metricsLoading)} total agents`}
          icon={<BarChartIcon sx={{ fontSize: 22 }} />}
          iconBgColor={theme.app.dashboard.accentBlue}
          valueColor={theme.app.dashboard.accentCyan}
          showTrendArrow={false}
        />
        <MetricCard
          title="Chats in Progress"
          value={formatDashboardCount(monitor.inProgress, metricsLoading)}
          subtitle={`Average ${avgPerAgent} per online agent`}
          icon={<BarChartIcon sx={{ fontSize: 22 }} />}
          iconBgColor={theme.app.dashboard.accentPurple}
          valueColor={theme.app.dashboard.accentCyan}
          showTrendArrow={false}
        />
        <MetricCard
          title="Chats Waiting"
          value={formatDashboardCount(monitor.waitingChats, metricsLoading)}
          subtitle={`Longest wait ${metricsLoading ? "…" : formatDurationSeconds(monitor.longestWaitSeconds)}`}
          icon={<BarChartIcon sx={{ fontSize: 22 }} />}
          iconBgColor={theme.app.dashboard.accentPurple}
          valueColor={theme.app.dashboard.accentCyan}
          showTrendArrow={false}
        />
        <MetricCard
          title="Escalated Chats"
          value={formatDashboardCount(monitor.escalated, metricsLoading)}
          subtitle="Supervisor takeover active"
          icon={<BarChartIcon sx={{ fontSize: 22 }} />}
          iconBgColor={theme.app.dashboard.accentRed}
          valueColor={theme.app.dashboard.accentRedLight}
          subtitleColor={theme.app.dashboard.accentRedLight}
          showTrendArrow={false}
        />
      </Box>
        }
        agentLiveQa={
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
          {agentRows.length === 0 ? (
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, py: 2 }}>
              No agent roster data available.
            </Typography>
          ) : (
            <DataTable<AgentRow>
              columns={agentColumns}
              rows={agentRows}
              getRowId={(row) => row.id}
              size="small"
            />
          )}
          <Box sx={viewAllAgentWrap}>
            <Box component="a" href="/dashboard/chat-monitor" sx={getViewAllAgentLink(theme)}>
              View All Agent ({formatDashboardCount(monitor.agentsTotal, monitor.loading)})
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
                    Selected report range
                  </Typography>
                </Box>
              </Box>
              <Box sx={ratingValueBox}>
                <StarIcon sx={starIconYellow} />
                <Typography variant="h6" fontWeight={700} sx={getRatingValuePurple(theme)}>
                  {metricsLoading ? "…" : formatScore(qaSummary?.avgQaScore ?? reports.overview?.qa.avgOverallScore)}
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
                {formatDashboardCount(excellentCount, metricsLoading)}
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
                {formatDashboardCount(poorCount, metricsLoading)}
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
        }
        liveChatMonitor={
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
          <Button
            variant="outlined"
            sx={getMonitorAllButton(theme)}
            href="/dashboard/chat-monitor"
            component="a"
          >
            Monitor All
          </Button>
        </Box>
        <Box sx={liveChatGrid}>
          {liveChats.length === 0 ? (
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, py: 2 }}>
              No live chats to monitor right now.
            </Typography>
          ) : (
            liveChats.map((chat) => (
              <Box key={chat.id} sx={getLiveChatCard(theme)}>
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
                  {chat.message}
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
                <Box component="a" href={`/dashboard/chat-monitor?conversationId=${chat.id}`} sx={getQuickViewLink(theme)}>
                  Quick View
                  <ArrowForwardIcon sx={{ fontSize: 14 }} />
                </Box>
              </Box>
            </Box>
            ))
          )}
        </Box>
      </DashboardCard>
        }
        websiteTraffic={
          <WebsiteTrafficSummarySection dateRangeLabel={dateRangeValue} />
        }
      />
    </Box>
  );
}
