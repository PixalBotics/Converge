"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import PhoneIphoneOutlined from "@mui/icons-material/PhoneIphoneOutlined";
import ComputerOutlined from "@mui/icons-material/ComputerOutlined";
import ChatOutlined from "@mui/icons-material/ChatOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import InsightsOutlined from "@mui/icons-material/InsightsOutlined";
import UpdateOutlined from "@mui/icons-material/UpdateOutlined";
import VerifiedOutlined from "@mui/icons-material/VerifiedOutlined";
import CloudDoneOutlined from "@mui/icons-material/CloudDoneOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import TimerOutlined from "@mui/icons-material/TimerOutlined";
import ThumbUpAltOutlined from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlined from "@mui/icons-material/ThumbDownAltOutlined";
import SendOutlined from "@mui/icons-material/SendOutlined";
import MilitaryTechOutlined from "@mui/icons-material/MilitaryTechOutlined";
import PublicOutlined from "@mui/icons-material/PublicOutlined";
import ForumOutlined from "@mui/icons-material/ForumOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import TrendingDownOutlined from "@mui/icons-material/TrendingDownOutlined";
import TrendingFlatOutlined from "@mui/icons-material/TrendingFlatOutlined";
import { DashboardCard, Typography } from "@/components/common";
import type { MonthlyChatSummaryResponse } from "@/api/reports/reports.types";
import { formatMetricValue, formatTrendBadge } from "../utils/report-params";
import { ReportSourcePieCard } from "./ReportSourcePieCard";

function SectionHeader({ icon, title }: { icon: ReactNode; title: string }) {
  const theme = useTheme() as AppTheme;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 34,
          height: 34,
          borderRadius: 1.25,
          color: theme.app.dashboard.accentBlue,
          bgcolor: theme.app.dashboard.pillBg,
          border: `1px solid ${theme.app.dashboard.shellBorder}`,
        }}
      >
        {icon}
      </Box>
      <Typography fontWeight={700} sx={{ fontSize: 16 }}>
        {title}
      </Typography>
    </Box>
  );
}

function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  const theme = useTheme() as AppTheme;
  if (trend === "up") {
    return <TrendingUpOutlined sx={{ fontSize: 14, color: theme.palette.success.main }} />;
  }
  if (trend === "down") {
    return <TrendingDownOutlined sx={{ fontSize: 14, color: theme.palette.error.main }} />;
  }
  return <TrendingFlatOutlined sx={{ fontSize: 14, color: theme.app.dashboard.textMuted }} />;
}

function MetricCard({
  label,
  metric,
  suffix = "",
  icon,
}: {
  label: string;
  metric: {
    value: number;
    percentage: number | null;
    trend: "up" | "down" | "flat";
    trendChangePct: number | null;
  };
  suffix?: string;
  icon: ReactNode;
}) {
  const theme = useTheme() as AppTheme;
  const trendColor =
    metric.trend === "up"
      ? theme.palette.success.main
      : metric.trend === "down"
        ? theme.palette.error.main
        : theme.app.dashboard.textMuted;

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        border: `1px solid ${theme.app.dashboard.shellBorder}`,
        bgcolor: theme.app.dashboard.cardBg,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 11 }}>
            {label}
          </Typography>
          <Typography fontWeight={700} sx={{ fontSize: 18, mt: 0.25 }}>
            {formatMetricValue(metric.value, suffix)}
            {metric.percentage !== null ? ` (${metric.percentage.toFixed(1)}%)` : ""}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.35, mt: 0.25 }}>
            <TrendIcon trend={metric.trend} />
            <Typography variant="caption" sx={{ color: trendColor, fontWeight: 600 }}>
              {formatTrendBadge(metric.trend, metric.trendChangePct)}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            borderRadius: 1,
            flexShrink: 0,
            color: theme.app.dashboard.accentPurple,
            bgcolor: theme.app.dashboard.pillBg,
          }}
        >
          {icon}
        </Box>
      </Box>
    </Box>
  );
}

export function MonthlySummaryView({ data }: { data: MonthlyChatSummaryResponse }) {
  const { accountSummary, topMetrics, systemInformation, performance, topSources } = data;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <DashboardCard sx={{ p: 2 }}>
        <SectionHeader icon={<PeopleOutlined fontSize="small" />} title="Account summary" />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
            gap: 1.5,
          }}
        >
          <MetricCard
            label="Visitors (total)"
            metric={accountSummary.visitors.total}
            icon={<VisibilityOutlined sx={{ fontSize: 18 }} />}
          />
          <MetricCard
            label="Visitors (mobile)"
            metric={accountSummary.visitors.mobile}
            icon={<PhoneIphoneOutlined sx={{ fontSize: 18 }} />}
          />
          <MetricCard
            label="Visitors (desktop)"
            metric={accountSummary.visitors.desktop}
            icon={<ComputerOutlined sx={{ fontSize: 18 }} />}
          />
          <MetricCard
            label="Chats (total)"
            metric={accountSummary.chats.total}
            icon={<ChatOutlined sx={{ fontSize: 18 }} />}
          />
          <MetricCard
            label="Chats (mobile)"
            metric={accountSummary.chats.mobile}
            icon={<PhoneIphoneOutlined sx={{ fontSize: 18 }} />}
          />
          <MetricCard
            label="Chats (desktop)"
            metric={accountSummary.chats.desktop}
            icon={<ComputerOutlined sx={{ fontSize: 18 }} />}
          />
          <MetricCard
            label="Meaningful chats (total)"
            metric={accountSummary.meaningfulChats.total}
            icon={<CheckCircleOutline sx={{ fontSize: 18 }} />}
          />
          <MetricCard
            label="Meaningful (mobile)"
            metric={accountSummary.meaningfulChats.mobile}
            icon={<PhoneIphoneOutlined sx={{ fontSize: 18 }} />}
          />
          <MetricCard
            label="Meaningful (desktop)"
            metric={accountSummary.meaningfulChats.desktop}
            icon={<ComputerOutlined sx={{ fontSize: 18 }} />}
          />
        </Box>
      </DashboardCard>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
        }}
      >
        <DashboardCard sx={{ p: 2 }}>
          <SectionHeader icon={<InsightsOutlined fontSize="small" />} title="Top metrics" />
          <Box sx={{ display: "grid", gap: 1.5 }}>
            <MetricCard
              label="Updates received"
              metric={topMetrics.updatesReceived}
              icon={<UpdateOutlined sx={{ fontSize: 18 }} />}
            />
            <MetricCard
              label="Quality coverage"
              metric={topMetrics.qualityCoverage}
              suffix="%"
              icon={<VerifiedOutlined sx={{ fontSize: 18 }} />}
            />
          </Box>
        </DashboardCard>
        <DashboardCard sx={{ p: 2 }}>
          <SectionHeader icon={<CloudDoneOutlined fontSize="small" />} title="System information" />
          <Box sx={{ display: "grid", gap: 1.5 }}>
            <MetricCard
              label="Service uptime"
              metric={systemInformation.serviceUptimePercentage}
              suffix="%"
              icon={<CloudDoneOutlined sx={{ fontSize: 18 }} />}
            />
            <MetricCard
              label="Team strength"
              metric={systemInformation.teamStrength}
              icon={<GroupsOutlined sx={{ fontSize: 18 }} />}
            />
            <MetricCard
              label="Avg popup time"
              metric={systemInformation.avgChatPopupTimeSeconds}
              suffix="s"
              icon={<TimerOutlined sx={{ fontSize: 18 }} />}
            />
          </Box>
        </DashboardCard>
      </Box>

      <DashboardCard sx={{ p: 2 }}>
        <SectionHeader icon={<MilitaryTechOutlined fontSize="small" />} title="Performance" />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            gap: 1.5,
          }}
        >
          <MetricCard
            label="Positive feedback"
            metric={performance.positiveClientFeedback}
            icon={<ThumbUpAltOutlined sx={{ fontSize: 18 }} />}
          />
          <MetricCard
            label="Negative feedback"
            metric={performance.negativeClientFeedback}
            icon={<ThumbDownAltOutlined sx={{ fontSize: 18 }} />}
          />
          <MetricCard
            label="Wrap-ups sent"
            metric={performance.distributionWrapUpsSent}
            icon={<SendOutlined sx={{ fontSize: 18 }} />}
          />
          <MetricCard
            label="QA achievements"
            metric={performance.qaAchievements}
            icon={<MilitaryTechOutlined sx={{ fontSize: 18 }} />}
          />
        </Box>
      </DashboardCard>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        <ReportSourcePieCard
          title="Top traffic sources"
          icon={<PublicOutlined fontSize="small" />}
          rows={topSources.topTrafficSources}
        />
        <ReportSourcePieCard
          title="Top chat sources"
          icon={<ForumOutlined fontSize="small" />}
          rows={topSources.topChatSources}
        />
      </Box>
    </Box>
  );
}
