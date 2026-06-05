"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import ChatBubbleOutline from "@mui/icons-material/ChatBubbleOutline";
import PeopleOutline from "@mui/icons-material/PeopleOutline";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, MetricCard, Typography } from "@/components/common";
import { ChatScopeFiltersPanel } from "@/features/chat-shared/components/ChatScopeFiltersPanel";
import { useChatScopeFilters } from "@/features/chat-shared/hooks/useChatScopeFilters";
import { fetchWebsiteLeadsSummary } from "@/services/chat/website-analytics.api";
import { cardPadding, grid4 } from "@/app/dashboard/supervisor-dashboard/SupervisorDashboardOverview.styles";

const DATE_RANGE_DAYS: Record<string, number> = {
  "Last 7 Days": 7,
  "Last 30 Days": 30,
  "Last 90 Days": 90,
};

function formatStatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function resolveDateRange(label: string): { from: string; to: string } {
  const days = DATE_RANGE_DAYS[label] ?? 30;
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return { from: formatStatDate(from), to: formatStatDate(to) };
}

type WebsiteTrafficSummarySectionProps = {
  dateRangeLabel: string;
};

export function WebsiteTrafficSummarySection({
  dateRangeLabel,
}: WebsiteTrafficSummarySectionProps) {
  const theme = useTheme() as AppTheme;
  const scope = useChatScopeFilters(undefined, { apiEnabled: true });
  const websiteId = scope.filters.websiteId.trim();
  const range = useMemo(() => resolveDateRange(dateRangeLabel), [dateRangeLabel]);

  const summaryQuery = useQuery({
    queryKey: ["website-leads-summary", websiteId, range.from, range.to],
    queryFn: () =>
      fetchWebsiteLeadsSummary({
        websiteId,
        from: range.from,
        to: range.to,
      }),
    enabled: Boolean(websiteId),
    staleTime: 60_000,
  });

  const totals = summaryQuery.data?.totals ?? {};
  const formatCount = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value) ? value.toLocaleString() : "—";

  return (
    <DashboardCard sx={{ ...cardPadding, mb: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <LanguageOutlined sx={{ fontSize: 20, color: theme.app.dashboard.accentCyan }} />
        <Typography variant="subtitle1" fontWeight={600} color="white">
          Website traffic & chats
        </Typography>
      </Box>
      <Typography
        variant="caption"
        sx={{ display: "block", mb: 1.5, color: theme.app.dashboard.textMuted }}
      >
        Live analytics via socket (REST fallback). Select a website to load totals for{" "}
        {dateRangeLabel.toLowerCase()}.
      </Typography>
      <Box sx={{ mb: 2 }}>
        <ChatScopeFiltersPanel
          filters={scope.filters}
          onPatch={scope.patchFilters}
          onReset={scope.resetFilters}
          canFilterByResellerId={scope.canFilterByResellerId}
          resellerOptions={scope.resellerOptions}
          parentCompanyOptions={scope.parentCompanyOptions}
          childCompanyOptions={scope.childCompanyOptions}
          websiteOptions={scope.websiteOptions}
          compact
        />
      </Box>
      {!websiteId ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
          Choose a website above to view visitor and chat metrics.
        </Typography>
      ) : summaryQuery.isLoading ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
          Loading analytics…
        </Typography>
      ) : summaryQuery.isError ? (
        <Typography variant="body2" sx={{ color: theme.palette.error.main }}>
          Could not load website analytics. Check report permissions and try again.
        </Typography>
      ) : (
        <Box sx={grid4}>
          <MetricCard
            title="Unique visitors"
            value={formatCount(totals.totalTraffic)}
            subtitle={`${formatCount(totals.totalPageViews)} page views`}
            icon={<PeopleOutline sx={{ fontSize: 22 }} />}
            iconBgColor={theme.app.dashboard.accentBlue}
            valueColor={theme.app.dashboard.accentCyan}
          />
          <MetricCard
            title="Widget opens"
            value={formatCount(totals.widgetOpened)}
            subtitle="Launcher opened"
            icon={<TrendingUpOutlined sx={{ fontSize: 22 }} />}
            iconBgColor={theme.app.dashboard.accentPurple}
            valueColor={theme.app.dashboard.accentCyan}
          />
          <MetricCard
            title="Chats started"
            value={formatCount(totals.totalChats)}
            subtitle={`${formatCount(totals.meaningfulChats)} meaningful (QA)`}
            icon={<ChatBubbleOutline sx={{ fontSize: 22 }} />}
            iconBgColor={theme.app.dashboard.accentGreen}
            valueColor={theme.app.dashboard.accentCyan}
          />
          <MetricCard
            title="Leads captured"
            value={formatCount(totals.leadsCaptured)}
            subtitle={`${formatCount(totals.chatsWithoutLead)} chats without lead`}
            icon={<LanguageOutlined sx={{ fontSize: 22 }} />}
            iconBgColor={theme.app.dashboard.accentOrange}
            valueColor={theme.app.dashboard.accentCyan}
          />
        </Box>
      )}
    </DashboardCard>
  );
}
