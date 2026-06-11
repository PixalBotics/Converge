"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { useAuth } from "@/lib/auth";
import {
  canAccessChatMonitor,
  canViewChatReports,
  useChatApiGates,
} from "@/lib/permissions";
import { OP } from "@/lib/permissions/operational-keys";
import {
  Button,
  DashboardCard,
  DataTable,
  PermissionDeniedPanel,
  Typography,
} from "@/components/common";
import {
  ChatLivePageHeader,
  ChatLivePageShell,
  ChatScopeFiltersPanel,
  calendarDateToIsoEnd,
  calendarDateToIsoStart,
  isoToCalendarDate,
  useChatScopeFilters,
} from "@/features/chat-shared";
import { useChatReports } from "@/features/chat-reports/hooks/useChatReports";
import { defaultReportRange } from "@/features/chat-reports/utils/format-metric";
import { formatScore } from "@/features/chat-reports/utils/format-metric";
import {
  chatReportsKpiCardSx,
  chatReportsKpiGridSx,
  chatReportsSectionSx,
} from "@/features/chat-reports/styles/chat-reports.styles";
import { QaSupervisorReviewDetailModal } from "./QaSupervisorReviewDetailModal";

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

function resolveTeamScopeLabel(
  hasOperational: (p: string) => boolean,
  isPlatformAdmin: boolean,
): string {
  if (isPlatformAdmin || hasOperational(OP.chat.auditPlatform)) {
    return "Organization-wide — all agents in your org scope.";
  }
  if (hasOperational(OP.chat.monitorParentCompany)) {
    return "External scope — QA performance for chats under your parent company.";
  }
  if (hasOperational(OP.chat.monitorDepartment)) {
    return "Department head — QA performance for everyone in your department(s).";
  }
  if (hasOperational(OP.chat.monitorPool)) {
    return "Pool head — QA performance for agents in your pool(s).";
  }
  return "Your monitored chat scope.";
}

type AgentPerfRow = {
  key: string;
  label: string;
  reviewCount: number;
  avgScore: string;
  lowScoreCount: number;
  slowReplyChats: number;
  timelyResponseMisses: number;
};

type IssueRow = {
  id: string;
  websiteLabel: string;
  agentLabel: string;
  poolName: string;
  score: string;
  slowInfo: string;
  failureReason: string;
  conversationId: string;
};

type ReviewLogRow = {
  id: string;
  websiteLabel: string;
  agentLabel: string;
  qaReviewerLabel: string;
  poolName: string;
  score: string;
  slowInfo: string;
  completedAt: string;
  conversationId: string;
};

const defaultRange = defaultReportRange();

export function QaTeamQualityWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme() as AppTheme;
  const { hasOperational, permissionsSyncing, isPlatformAdmin } = useAuth();
  const gates = useChatApiGates();
  const allowed =
    gates.reports && (gates.monitor || isPlatformAdmin) && canViewChatReports(hasOperational);
  const reports = useChatReports({ apiEnabled: allowed });
  const scopeFilters = useChatScopeFilters(
    {
      dateFrom: isoToCalendarDate(defaultRange.from),
      dateTo: isoToCalendarDate(defaultRange.to),
    },
    { apiEnabled: allowed },
  );

  const highlightAgentId = searchParams.get("agentId")?.trim() ?? "";
  const urlWebsiteId = searchParams.get("websiteId")?.trim() ?? "";
  const [detailConversationId, setDetailConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (!permissionsSyncing && !allowed) {
      router.replace("/dashboard/chat-reports");
    }
  }, [allowed, permissionsSyncing, router]);

  useEffect(() => {
    const from =
      calendarDateToIsoStart(scopeFilters.filters.dateFrom) || defaultRange.from;
    const to = calendarDateToIsoEnd(scopeFilters.filters.dateTo) || defaultRange.to;
    reports.setRange({ from, to });
    reports.setWebsiteId(urlWebsiteId || scopeFilters.filters.websiteId);
    reports.setDepartmentId(scopeFilters.filters.departmentId);
  }, [
    scopeFilters.filters.dateFrom,
    scopeFilters.filters.dateTo,
    scopeFilters.filters.websiteId,
    scopeFilters.filters.departmentId,
    urlWebsiteId,
    reports.setRange,
    reports.setWebsiteId,
    reports.setDepartmentId,
  ]);

  const scopeLabel = resolveTeamScopeLabel(hasOperational, isPlatformAdmin);

  const agentRows = useMemo((): AgentPerfRow[] => {
    const list = reports.qaQuality?.byAgent ?? [];
    const filtered = highlightAgentId
      ? list.filter((r) => r.key === highlightAgentId)
      : list;
    return filtered.map((row) => ({
      key: row.key,
      label: row.label,
      reviewCount: row.reviewCount,
      avgScore: formatScore(row.avgScore),
      lowScoreCount: row.lowScoreCount,
      slowReplyChats: row.slowReplyChats,
      timelyResponseMisses: row.timelyResponseMisses,
    }));
  }, [reports.qaQuality?.byAgent, highlightAgentId]);

  const issueRows = useMemo((): IssueRow[] => {
    const list = reports.qaQuality?.recentIssues ?? [];
    const filtered = highlightAgentId
      ? list.filter((i) => {
          const agent = reports.qaQuality?.byAgent.find((a) => a.key === highlightAgentId);
          return agent ? i.agentLabel === agent.label : true;
        })
      : list;
    return filtered.map((issue) => ({
      id: issue.conversationId,
      websiteLabel: issue.websiteLabel,
      agentLabel: issue.agentLabel,
      poolName: issue.poolName ?? "—",
      score: formatScore(issue.overallScore),
      slowInfo:
        issue.slowReplyCount > 0
          ? `${issue.slowReplyCount} late · max ${issue.maxReplySeconds ?? "—"}s`
          : "—",
      failureReason: issue.failureReason?.trim() || "—",
      conversationId: issue.conversationId,
    }));
  }, [reports.qaQuality?.recentIssues, reports.qaQuality?.byAgent, highlightAgentId]);

  const reviewLogRows = useMemo((): ReviewLogRow[] => {
    const list = reports.qaQuality?.reviewLog ?? [];
    const filtered = highlightAgentId
      ? list.filter((r) => {
          const agent = reports.qaQuality?.byAgent.find((a) => a.key === highlightAgentId);
          return agent ? r.agentLabel === agent.label : true;
        })
      : list;
    return filtered.map((row) => ({
      id: row.conversationId,
      websiteLabel: row.websiteLabel,
      agentLabel: row.agentLabel,
      qaReviewerLabel: row.qaReviewerLabel,
      poolName: row.poolName ?? "—",
      score: formatScore(row.overallScore),
      slowInfo:
        row.slowReplyCount > 0
          ? `${row.slowReplyCount} late · max ${row.maxReplySeconds ?? "—"}s`
          : "—",
      completedAt: row.completedAt ? new Date(row.completedAt).toLocaleString() : "—",
      conversationId: row.conversationId,
    }));
  }, [reports.qaQuality?.reviewLog, reports.qaQuality?.byAgent, highlightAgentId]);

  const openReviewDetail = (conversationId: string) => {
    setDetailConversationId(conversationId);
  };

  if (!permissionsSyncing && !allowed) {
    return (
      <PermissionDeniedPanel
        title="Team QA reports not available"
        description="Requires chat report view plus pool, department, or external monitor scope."
      />
    );
  }

  if (permissionsSyncing || !allowed) {
    return <Typography sx={{ py: 4 }}>Loading permissions…</Typography>;
  }

  return (
    <ChatLivePageShell>
      <ChatLivePageHeader
        title="Team QA quality"
        subtitle={`${scopeLabel} Open any completed QA report below — no QA inbox needed.`}
        navPreset="triage"
        trailing={
          canAccessChatMonitor(hasOperational) ? (
            <Button component={Link} href="/dashboard/chat-reports" variant="outlined" size="small">
              Full chat reports
            </Button>
          ) : null
        }
      />

      <DashboardCard sx={{ flexShrink: 0, p: { xs: 1.5, md: 2 }, height: "auto", minHeight: 0 }}>
        <ChatScopeFiltersPanel
          filters={scopeFilters.filters}
          onPatch={scopeFilters.patchFilters}
          onReset={scopeFilters.resetFilters}
          canFilterByResellerId={scopeFilters.canFilterByResellerId}
          resellerOptions={scopeFilters.resellerOptions}
          parentCompanyOptions={scopeFilters.parentCompanyOptions}
          childCompanyOptions={scopeFilters.childCompanyOptions}
          websiteOptions={scopeFilters.websiteOptions}
          hint="Date range and website filters apply to your team scope automatically."
        />
      </DashboardCard>

      {reports.qaQualityLoading ? (
        <Typography sx={{ color: theme.app.dashboard.textMuted, py: 3 }}>
          Loading team QA report…
        </Typography>
      ) : reports.qaQuality ? (
        <>
          <Box
            sx={{
              ...chatReportsKpiGridSx,
              gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
              mb: 2,
            }}
          >
            <KpiCard label="QA reviews" value={String(reports.qaQuality.summary.completedReviews)} />
            <KpiCard label="Avg QA score" value={formatScore(reports.qaQuality.summary.avgQaScore)} />
            <KpiCard
              label="Chats with late replies"
              value={String(reports.qaQuality.summary.slowReplyChatCount)}
            />
            <KpiCard
              label="Timely response misses"
              value={String(reports.qaQuality.summary.checklistMisses.timelyResponse ?? 0)}
            />
          </Box>

          <DashboardCard sx={{ ...chatReportsSectionSx, mb: 0, p: { xs: 1.5, md: 2 } }}>
            <Typography fontWeight={700} sx={{ fontSize: 14, mb: 1 }}>
              Agent performance
              {highlightAgentId ? " (filtered)" : ""}
            </Typography>
            <DataTable<AgentPerfRow>
              columns={[
                { id: "label", label: "Agent" },
                { id: "reviewCount", label: "Reviews" },
                { id: "avgScore", label: "Avg score" },
                { id: "lowScoreCount", label: "Low scores" },
                { id: "slowReplyChats", label: "Late reply chats" },
                { id: "timelyResponseMisses", label: "Timely misses", cellVariant: "muted" },
              ]}
              rows={agentRows}
              getRowId={(row) => row.key}
              selectedRowId={highlightAgentId || null}
              isLoading={reports.qaQualityLoading}
              emptyState={{
                title: "No QA reviews in range",
                description: "Completed QA reviews for your team will appear here.",
              }}
              actionColumn={{
                label: "Filter",
                render: (row) => (
                  <Button
                    component={Link}
                    href={`/dashboard/qa/team-quality?agentId=${encodeURIComponent(row.key)}`}
                    variant="secondary"
                    size="small"
                  >
                    Focus
                  </Button>
                ),
              }}
            />
          </DashboardCard>

          {reviewLogRows.length > 0 ? (
            <DashboardCard sx={{ ...chatReportsSectionSx, p: { xs: 1.5, md: 2 } }}>
              <Typography fontWeight={700} sx={{ fontSize: 14, mb: 0.5 }}>
                Completed QA reviews
              </Typography>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}>
                Pool / department / external heads can open full chat QA detail here.
              </Typography>
              <DataTable<ReviewLogRow>
                columns={[
                  { id: "completedAt", label: "Completed", cellVariant: "muted" },
                  { id: "websiteLabel", label: "Website" },
                  { id: "agentLabel", label: "Agent" },
                  { id: "qaReviewerLabel", label: "QA reviewer" },
                  { id: "poolName", label: "Pool", cellVariant: "muted" },
                  { id: "score", label: "Score" },
                  { id: "slowInfo", label: "Late replies" },
                ]}
                rows={reviewLogRows}
                getRowId={(row) => row.id}
                onRowClick={(row) => openReviewDetail(row.conversationId)}
                actionColumn={{
                  label: "View",
                  render: (row) => (
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        openReviewDetail(row.conversationId);
                      }}
                    >
                      View report
                    </Button>
                  ),
                }}
              />
            </DashboardCard>
          ) : null}

          {issueRows.length > 0 ? (
            <DashboardCard sx={{ ...chatReportsSectionSx, p: { xs: 1.5, md: 2 }, mt: 2 }}>
              <Typography fontWeight={700} sx={{ fontSize: 14, mb: 1 }}>
                Recent issues
              </Typography>
              <DataTable<IssueRow>
                columns={[
                  { id: "websiteLabel", label: "Website" },
                  { id: "agentLabel", label: "Agent" },
                  { id: "poolName", label: "Pool", cellVariant: "muted" },
                  { id: "score", label: "Score" },
                  { id: "slowInfo", label: "Late replies" },
                  { id: "failureReason", label: "Failure reason", cellVariant: "muted" },
                ]}
                rows={issueRows}
                getRowId={(row) => row.id}
                actionColumn={{
                  label: "View",
                  render: (row) => (
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={() => openReviewDetail(row.conversationId)}
                    >
                      View report
                    </Button>
                  ),
                }}
              />
            </DashboardCard>
          ) : null}
        </>
      ) : (
        <Typography sx={{ color: theme.app.dashboard.textMuted, py: 3 }}>
          No team QA data for this range.
        </Typography>
      )}
      <QaSupervisorReviewDetailModal
        open={Boolean(detailConversationId)}
        conversationId={detailConversationId}
        onClose={() => setDetailConversationId(null)}
      />
    </ChatLivePageShell>
  );
}
