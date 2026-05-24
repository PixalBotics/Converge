"use client";

import { useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { useAuth } from "@/lib/auth";
import { mergeSx } from "@/lib/mui/merge-sx";
import { PermissionDeniedPanel } from "@/components/common";
import { useChatApiGates } from "@/lib/permissions";
import { Button, DashboardCard, Typography } from "@/components/common";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChatLivePageHeader,
  ChatScopeFiltersPanel,
  calendarDateToIsoEnd,
  calendarDateToIsoStart,
  isoToCalendarDate,
  useChatScopeFilters,
} from "@/features/chat-shared";
import { chatLivePageStackSx } from "@/features/chat-shared/styles/chat-live.styles";
import { useChatReports } from "../hooks/useChatReports";
import { ReportBucketTable } from "./ReportBucketTable";
import { defaultReportRange } from "../utils/format-metric";
import {
  chatReportsContentSx,
  chatReportsKpiCardSx,
  chatReportsKpiGridSx,
  chatReportsPageWrapper,
  chatReportsSectionSx,
} from "../styles/chat-reports.styles";
import { formatDurationSeconds, formatScore } from "../utils/format-metric";

function KpiCard({ label, value }: { label: string; value: string }) {
  const theme = useTheme() as AppTheme;
  return (
    <Box sx={chatReportsKpiCardSx}>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 11 }}>
        {label}
      </Typography>
      <Typography fontWeight={700} sx={{ fontSize: 18, mt: 0.25 }}>
        {value}
      </Typography>
    </Box>
  );
}

const defaultRange = defaultReportRange();

export function ChatReportsDashboard() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const { hasOperational, hasPage, permissionsSyncing } = useAuth();
  const gates = useChatApiGates();
  const allowed = gates.reports;
  const reports = useChatReports({ apiEnabled: allowed });
  const scopeFilters = useChatScopeFilters(
    {
      dateFrom: isoToCalendarDate(defaultRange.from),
      dateTo: isoToCalendarDate(defaultRange.to),
    },
    { apiEnabled: allowed },
  );

  useEffect(() => {
    if (!permissionsSyncing && !allowed) router.replace("/dashboard/chat-operations");
  }, [allowed, permissionsSyncing, router]);

  useEffect(() => {
    const from =
      calendarDateToIsoStart(scopeFilters.filters.dateFrom) || defaultRange.from;
    const to = calendarDateToIsoEnd(scopeFilters.filters.dateTo) || defaultRange.to;
    reports.setRange({ from, to });
    reports.setWebsiteId(scopeFilters.filters.websiteId);
    reports.setDepartmentId(scopeFilters.filters.departmentId);
  }, [
    scopeFilters.filters.dateFrom,
    scopeFilters.filters.dateTo,
    scopeFilters.filters.departmentId,
    scopeFilters.filters.websiteId,
    reports.setRange,
    reports.setWebsiteId,
    reports.setDepartmentId,
  ]);

  if (!permissionsSyncing && !allowed) {
    return (
      <PermissionDeniedPanel
        title="Chat reports not available"
        description="Requires page:chat and chat:report:view from /auth/me."
      />
    );
  }

  if (permissionsSyncing || !allowed) {
    return <Typography sx={{ py: 4 }}>Loading permissions…</Typography>;
  }

  if (!reports.token) {
    return <Typography sx={{ py: 4 }}>Sign in to view chat reports.</Typography>;
  }

  const summary = reports.overview?.summary;
  const qa = reports.overview?.qa;
  const deptChart = (reports.overview?.byDepartment ?? []).slice(0, 8).map((b) => ({
    name: b.label.length > 14 ? `${b.label.slice(0, 12)}…` : b.label,
    chats: b.conversationCount,
  }));

  return (
    <Box sx={mergeSx(chatReportsPageWrapper, chatLivePageStackSx)}>
      <Box sx={chatReportsContentSx}>
        <ChatLivePageHeader
          title="Live chat reports"
          subtitle="Scoped metrics from closed and active conversations in your monitor access."
          navItems={[]}
          trailing={
            <Button type="button" variant="outlined" onClick={() => void reports.refresh()}>
              Refresh
            </Button>
          }
        />

        <DashboardCard sx={{ flexShrink: 0, p: { xs: 1.5, md: 2 }, height: "auto", minHeight: 0 }}>
          <ChatScopeFiltersPanel
            filters={scopeFilters.filters}
            onPatch={scopeFilters.patchFilters}
            onReset={() => {
              scopeFilters.resetFilters();
              const dr = defaultReportRange();
              scopeFilters.patchFilters({
                dateFrom: isoToCalendarDate(dr.from),
                dateTo: isoToCalendarDate(dr.to),
              });
            }}
            canFilterByResellerId={scopeFilters.canFilterByResellerId}
            resellerOptions={scopeFilters.resellerOptions}
            parentCompanyOptions={scopeFilters.parentCompanyOptions}
            childCompanyOptions={scopeFilters.childCompanyOptions}
            websiteOptions={scopeFilters.websiteOptions}
            showDateRange
            hint="Pick reseller, parent, and child company to narrow websites. Use the calendar for the report period."
          />
        </DashboardCard>

        {reports.loading ? (
          <Typography sx={{ color: theme.app.dashboard.textMuted }}>Loading report…</Typography>
        ) : reports.error ? (
          <Typography color="error">Could not load report. Check date range and permissions.</Typography>
        ) : reports.overview ? (
          <>
            {reports.overview.capped ? (
              <Typography variant="caption" sx={{ color: theme.palette.warning.main, display: "block", mb: 1 }}>
                Results capped at 8,000 conversations — narrow filters for full accuracy.
              </Typography>
            ) : null}
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 2 }}>
              Range {new Date(reports.overview.range.from).toLocaleDateString()} –{" "}
              {new Date(reports.overview.range.to).toLocaleDateString()}
            </Typography>

            <Box sx={chatReportsKpiGridSx}>
              <KpiCard label="Conversations" value={String(summary?.conversationCount ?? 0)} />
              <KpiCard label="Closed" value={String(summary?.closedCount ?? 0)} />
              <KpiCard label="Takeovers" value={String(summary?.takeoverCount ?? 0)} />
              <KpiCard
                label="Avg FRT"
                value={formatDurationSeconds(summary?.avgFirstResponseSeconds)}
              />
              <KpiCard
                label="Avg queue"
                value={formatDurationSeconds(summary?.avgQueueSeconds)}
              />
              <KpiCard
                label="Avg handle"
                value={formatDurationSeconds(summary?.avgHandleSeconds)}
              />
            </Box>

            <Box sx={{ ...chatReportsKpiGridSx, gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" } }}>
              <KpiCard label="Avg QA score" value={formatScore(summary?.avgQaScore)} />
              <KpiCard label="Avg CSAT" value={formatScore(summary?.avgCsatScore)} />
              <KpiCard label="QA pending" value={String(qa?.pending ?? 0)} />
              <KpiCard label="QA completed" value={String(qa?.completed ?? 0)} />
            </Box>

            {deptChart.length > 0 ? (
              <Box sx={{ ...chatReportsSectionSx, height: 280 }}>
                <Typography fontWeight={700} sx={{ fontSize: 14, mb: 1 }}>
                  Volume by department
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.app.dashboard.cardBorder} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="chats" fill={theme.app.dashboard.accentBlue} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : null}

            <Box sx={chatReportsSectionSx}>
              <ReportBucketTable title="By department" rows={reports.overview.byDepartment} />
            </Box>
            <Box sx={chatReportsSectionSx}>
              <ReportBucketTable title="By topic / routing key" rows={reports.overview.byRoutingKey} />
            </Box>
            <Box sx={chatReportsSectionSx}>
              <ReportBucketTable title="By agent" rows={reports.overview.byAgent} />
            </Box>
          </>
        ) : null}
      </Box>
    </Box>
  );
}
