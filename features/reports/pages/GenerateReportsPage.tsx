"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  DataTable,
  PermissionDeniedPanel,
  SelectField,
  TablePagination,
  ToolbarFilterPopover,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  integrationsFooterRow,
  integrationsPaginationWrapper,
} from "@/app/dashboard/integrations/integrations.styles";
import type { ReportType } from "@/api/reports/reports.types";
import type {
  ChatTranscriptItem,
  TrafficConversionRow,
  WebsiteDistributionItem,
} from "@/api/reports/reports.types";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import {
  useChatScopeFilters,
  calendarDateToIsoEnd,
  calendarDateToIsoStart,
} from "@/features/chat-shared";
import { REPORT_TYPE_OPTIONS } from "../reports.constants";
import { ReportFiltersPanel } from "../components/ReportFiltersPanel";
import { ReportMetadataHeader } from "../components/ReportMetadataHeader";
import { MonthlySummaryView } from "../components/MonthlySummaryView";
import { MonthWiseChatChart } from "../components/MonthWiseChatChart";
import {
  buildReportPeriodParams,
  buildReportScopeParams,
  defaultReportPeriodState,
  formatRatioPercent,
  hasReportScope,
  type ReportPeriodState,
} from "../utils/report-params";
import {
  useChatTranscriptsReportQuery,
  useMonthWiseChatCountQuery,
  useMonthlyChatSummaryQuery,
  useTrafficConversionQuery,
  useWebsiteDistributionReportQuery,
} from "../hooks/useReportsQueries";

const PAGE_SIZE = 20;

type TrafficRow = TrafficConversionRow & Record<string, unknown>;
type TranscriptRow = ChatTranscriptItem & Record<string, unknown>;
type DistributionRow = WebsiteDistributionItem & Record<string, unknown>;

const TRAFFIC_COLUMNS: DataTableColumn<TrafficRow>[] = [
  { id: "domainName", label: "Domain" },
  { id: "websiteUrl", label: "Website URL" },
  { id: "uniqueVisitors", label: "Visitors", render: (_v, row) => row.uniqueVisitors.toLocaleString() },
  { id: "greets", label: "Greets", render: (_v, row) => row.greets.toLocaleString() },
  { id: "notGreeted", label: "Not greeted", render: (_v, row) => row.notGreeted.toLocaleString() },
  { id: "chats", label: "Chats", render: (_v, row) => row.chats.toLocaleString() },
  { id: "meaningfulChats", label: "Meaningful", render: (_v, row) => row.meaningfulChats.toLocaleString() },
  {
    id: "visitorToChatRatio",
    label: "Visitor→Chat %",
    render: (_v, row) => formatRatioPercent(row.visitorToChatRatio),
  },
  {
    id: "greetToChatRatio",
    label: "Greet→Chat %",
    render: (_v, row) => formatRatioPercent(row.greetToChatRatio),
  },
  {
    id: "chatToMeaningfulChatsRatio",
    label: "Chat→Meaningful %",
    render: (_v, row) => formatRatioPercent(row.chatToMeaningfulChatsRatio),
  },
];

const TRANSCRIPT_COLUMNS: DataTableColumn<TranscriptRow>[] = [
  { id: "chatId", label: "Chat ID" },
  { id: "day", label: "Day" },
  { id: "chatStartTime", label: "Start" },
  { id: "chatEndTime", label: "End", render: (v) => (v ? String(v) : "—") },
  { id: "visitorName", label: "Visitor" },
  { id: "userName", label: "Agent", render: (v) => (v ? String(v) : "—") },
  { id: "domainName", label: "Domain" },
  { id: "department", label: "Department", render: (v) => (v ? String(v) : "—") },
  { id: "leadType", label: "Lead type" },
  { id: "source", label: "Source", render: (_v, row) => row.source.label },
  {
    id: "chatTranscript",
    label: "Transcript",
    render: (_v, row) => (
      <Link href={row.chatTranscript.url} style={{ fontSize: 13 }}>
        {row.chatTranscript.label}
      </Link>
    ),
  },
];

const DISTRIBUTION_COLUMNS: DataTableColumn<DistributionRow>[] = [
  { id: "domainName", label: "Domain" },
  { id: "websiteUrl", label: "Website URL" },
  { id: "departmentName", label: "Department" },
  { id: "addressType", label: "Address type" },
  { id: "emailForm", label: "Email form", render: (v) => (v ? String(v) : "—") },
  { id: "emailAddress", label: "Email" },
  { id: "distributionMethod", label: "Method" },
  {
    id: "setupIsActive",
    label: "Active",
    render: (_v, row) => (row.setupIsActive ? "Yes" : "No"),
  },
];

export function GenerateReportsPage() {
  const theme = useTheme() as AppTheme;
  const { hasOperational } = useAuth();
  const canView = hasOperational(OP.report.view);

  const [reportType, setReportType] = useState<ReportType>("traffic_chat_conversion_ratios");
  const [period, setPeriod] = useState<ReportPeriodState>(defaultReportPeriodState);
  const [leadType, setLeadType] = useState("");
  const [page, setPage] = useState(1);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  const scopeFilters = useChatScopeFilters(undefined, { apiEnabled: canView });

  const scopeParams = useMemo(
    () =>
      buildReportScopeParams({
        resellerId: scopeFilters.filters.resellerId,
        parentCompanyId: scopeFilters.filters.parentCompanyId,
        childCompanyId: scopeFilters.filters.childCompanyId,
        websiteId: scopeFilters.filters.websiteId,
      }),
    [
      scopeFilters.filters.resellerId,
      scopeFilters.filters.parentCompanyId,
      scopeFilters.filters.childCompanyId,
      scopeFilters.filters.websiteId,
    ],
  );

  const periodParams = useMemo(() => {
    if (period.mode === "range") {
      const from = calendarDateToIsoStart(scopeFilters.filters.dateFrom);
      const to = calendarDateToIsoEnd(scopeFilters.filters.dateTo);
      return from && to ? { from, to } : buildReportPeriodParams(period);
    }
    return buildReportPeriodParams(period);
  }, [period, scopeFilters.filters.dateFrom, scopeFilters.filters.dateTo]);

  const scopeReady = hasReportScope({
    resellerId: scopeFilters.filters.resellerId,
    parentCompanyId: scopeFilters.filters.parentCompanyId,
    childCompanyId: scopeFilters.filters.childCompanyId,
    websiteId: scopeFilters.filters.websiteId,
  });

  const queryEnabled = canView && scopeReady;

  const monthlyQuery = useMonthlyChatSummaryQuery(
    { ...scopeParams, ...periodParams },
    queryEnabled && reportType === "monthly_chat_summary",
  );
  const trafficQuery = useTrafficConversionQuery(
    { ...scopeParams, ...periodParams },
    queryEnabled && reportType === "traffic_chat_conversion_ratios",
  );
  const transcriptsQuery = useChatTranscriptsReportQuery(
    {
      ...scopeParams,
      ...periodParams,
      page,
      limit: PAGE_SIZE,
      ...(leadType ? { leadType: leadType as "Billable" | "Closed" } : {}),
    },
    queryEnabled && reportType === "chat_transcripts_report",
  );
  const distributionQuery = useWebsiteDistributionReportQuery(
    { ...scopeParams, page, limit: PAGE_SIZE },
    queryEnabled && reportType === "website_distribution_report",
  );
  const monthWiseQuery = useMonthWiseChatCountQuery(
    {
      ...scopeParams,
      ...(period.mode === "range" && periodParams.from && periodParams.to
        ? { from: periodParams.from, to: periodParams.to }
        : { monthCount: period.monthCount }),
    },
    queryEnabled && reportType === "month_wise_chat_count",
  );

  const activeQuery =
    reportType === "monthly_chat_summary"
      ? monthlyQuery
      : reportType === "traffic_chat_conversion_ratios"
        ? trafficQuery
        : reportType === "chat_transcripts_report"
          ? transcriptsQuery
          : reportType === "website_distribution_report"
            ? distributionQuery
            : monthWiseQuery;

  const hasActiveFilters = Boolean(
    scopeFilters.filters.resellerId ||
      scopeFilters.filters.parentCompanyId ||
      scopeFilters.filters.childCompanyId ||
      scopeFilters.filters.websiteId ||
      leadType,
  );

  const clearAllFilters = () => {
    scopeFilters.resetFilters();
    setLeadType("");
    setPeriod(defaultReportPeriodState());
  };

  useEffect(() => {
    setPage(1);
  }, [
    reportType,
    scopeFilters.filters.resellerId,
    scopeFilters.filters.parentCompanyId,
    scopeFilters.filters.childCompanyId,
    scopeFilters.filters.websiteId,
    period,
    leadType,
  ]);

  const trafficRows = useMemo<TrafficRow[]>(() => {
    const data = trafficQuery.data;
    if (!data) return [];
    return [...data.rows, data.totals].map((row) => ({ ...row }));
  }, [trafficQuery.data]);

  const transcriptRows = useMemo<TranscriptRow[]>(
    () => (transcriptsQuery.data?.items ?? []).map((row) => ({ ...row })),
    [transcriptsQuery.data],
  );

  const distributionRows = useMemo<DistributionRow[]>(
    () => (distributionQuery.data?.items ?? []).map((row) => ({ ...row })),
    [distributionQuery.data],
  );

  const paginatedTotal =
    reportType === "chat_transcripts_report"
      ? (transcriptsQuery.data?.total ?? 0)
      : reportType === "website_distribution_report"
        ? (distributionQuery.data?.total ?? 0)
        : 0;
  const paginatedTotalPages =
    reportType === "chat_transcripts_report"
      ? (transcriptsQuery.data?.totalPages ?? 1)
      : reportType === "website_distribution_report"
        ? (distributionQuery.data?.totalPages ?? 1)
        : 1;
  const rangeStart = paginatedTotal === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, paginatedTotal);

  if (!canView) {
    return (
      <PermissionDeniedPanel
        title="Reports access required"
        description="Requires page:reports and report:view from /auth/me."
      />
    );
  }

  const showPeriod = reportType !== "website_distribution_report";
  const showLeadType = reportType === "chat_transcripts_report";
  const isPaginated =
    reportType === "chat_transcripts_report" || reportType === "website_distribution_report";

  const metadata =
    monthlyQuery.data?.reportMetadata ??
    trafficQuery.data?.reportMetadata ??
    transcriptsQuery.data?.reportMetadata ??
    distributionQuery.data?.reportMetadata ??
    monthWiseQuery.data?.reportMetadata;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Generate Reports
          </Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            Fetch analytics and operational reports by organization scope and period.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
          <Box sx={{ minWidth: 240 }}>
            <SelectField
              label="Report type"
              value={reportType}
              onChange={(v) => setReportType(v as ReportType)}
              options={REPORT_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
          </Box>
          <ToolbarFilterPopover
            open={filterPopoverOpen}
            onOpenChange={setFilterPopoverOpen}
            active={hasActiveFilters}
          >
            <ReportFiltersPanel
              scope={scopeFilters.filters}
              onScopePatch={scopeFilters.patchFilters}
              canFilterByResellerId={scopeFilters.canFilterByResellerId}
              resellerOptions={scopeFilters.resellerOptions}
              parentCompanyOptions={scopeFilters.parentCompanyOptions}
              childCompanyOptions={scopeFilters.childCompanyOptions}
              websiteOptions={scopeFilters.websiteOptions}
              period={period}
              onPeriodChange={(patch) => setPeriod((p) => ({ ...p, ...patch }))}
              showPeriod={showPeriod}
              showLeadType={showLeadType}
              leadType={leadType}
              onLeadTypeChange={setLeadType}
              hasActiveFilters={hasActiveFilters}
              onClearAll={clearAllFilters}
              onClose={() => setFilterPopoverOpen(false)}
            />
          </ToolbarFilterPopover>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={!scopeReady || activeQuery.isFetching}
            onClick={() => void activeQuery.refetch()}
          >
            {activeQuery.isFetching ? "Loading…" : "Refresh report"}
          </Button>
        </Box>
      </Box>

      {!scopeReady ? (
        <DashboardCard sx={{ p: 3 }}>
          <Typography sx={{ color: theme.app.dashboard.textMuted, textAlign: "center" }}>
            Select at least one scope filter (reseller, parent company, child company, or website) to
            load a report.
          </Typography>
        </DashboardCard>
      ) : activeQuery.isError ? (
        <DashboardCard sx={{ p: 3 }}>
          <Typography color="error" sx={{ textAlign: "center" }}>
            {activeQuery.error instanceof Error
              ? activeQuery.error.message
              : "Unable to load report. Check scope permissions and date range."}
          </Typography>
        </DashboardCard>
      ) : activeQuery.isLoading ? (
        <DashboardCard sx={{ p: 3 }}>
          <Typography sx={{ color: theme.app.dashboard.textMuted }}>Loading report…</Typography>
        </DashboardCard>
      ) : (
        <>
          {metadata ? <ReportMetadataHeader metadata={metadata} /> : null}

          {reportType === "monthly_chat_summary" && monthlyQuery.data ? (
            <MonthlySummaryView data={monthlyQuery.data} />
          ) : null}

          {reportType === "month_wise_chat_count" && monthWiseQuery.data ? (
            <MonthWiseChatChart data={monthWiseQuery.data} />
          ) : null}

          {reportType === "traffic_chat_conversion_ratios" ? (
            <DashboardCard sx={{ p: { xs: 1, md: 2 } }}>
              <DataTable
                columns={TRAFFIC_COLUMNS}
                rows={trafficRows}
                getRowId={(row) => row.websiteId}
                emptyState={{
                  title: "No conversion data",
                  description: "No data for the selected scope and period.",
                }}
              />
            </DashboardCard>
          ) : null}

          {reportType === "chat_transcripts_report" ? (
            <DashboardCard sx={{ p: { xs: 1, md: 2 } }}>
              <DataTable
                columns={TRANSCRIPT_COLUMNS}
                rows={transcriptRows}
                getRowId={(row) => row.conversationId}
                emptyState={{
                  title: "No transcripts",
                  description: "No chat transcripts for the selected scope and period.",
                }}
              />
              <Box sx={integrationsFooterRow}>
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                  {paginatedTotal === 0
                    ? "No records"
                    : `Showing ${rangeStart}–${rangeEnd} of ${paginatedTotal}`}
                </Typography>
                <Box sx={integrationsPaginationWrapper}>
                  <TablePagination
                    page={page}
                    pageCount={paginatedTotalPages}
                    onPageChange={setPage}
                  />
                </Box>
              </Box>
            </DashboardCard>
          ) : null}

          {reportType === "website_distribution_report" ? (
            <DashboardCard sx={{ p: { xs: 1, md: 2 } }}>
              <DataTable
                columns={DISTRIBUTION_COLUMNS}
                rows={distributionRows}
                getRowId={(row) => `${row.websiteId}-${row.recipientId}-${row.distributionDepartmentId}`}
                emptyState={{
                  title: "No distribution rows",
                  description: "No distribution setup rows for the selected scope.",
                }}
              />
              <Box sx={integrationsFooterRow}>
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                  {paginatedTotal === 0
                    ? "No records"
                    : `Showing ${rangeStart}–${rangeEnd} of ${paginatedTotal}`}
                </Typography>
                <Box sx={integrationsPaginationWrapper}>
                  <TablePagination
                    page={page}
                    pageCount={paginatedTotalPages}
                    onPageChange={setPage}
                  />
                </Box>
              </Box>
            </DashboardCard>
          ) : null}
        </>
      )}
    </Box>
  );
}
