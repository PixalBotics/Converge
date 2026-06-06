"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import PublicOutlined from "@mui/icons-material/PublicOutlined";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { AppTheme } from "@/theme/theme";
import { useAuth } from "@/lib/auth";
import { useChatApiGates } from "@/lib/permissions";
import {
  Button,
  DashboardCard,
  DataTable,
  InputField,
  PermissionDeniedPanel,
  SelectField,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChatLivePageHeader,
  ChatLivePageShell,
  ChatScopeFiltersPanel,
  calendarDateToIsoEnd,
  calendarDateToIsoStart,
  isoToCalendarDate,
  useChatScopeFilters,
} from "@/features/chat-shared";
import {
  fetchWebsiteAnalyticsReport,
  fetchWebsiteVisitorDetail,
  fetchWebsiteVisitors,
  type WebsiteAnalyticsReport,
  type WebsiteVisitorRow,
} from "@/services/chat/website-analytics-report.api";
import { defaultReportRange } from "@/features/chat-reports/utils/format-metric";
import {
  chatReportsKpiCardSx,
  chatReportsKpiGridSx,
  chatReportsSectionSx,
} from "@/features/chat-reports/styles/chat-reports.styles";

const TRAFFIC_SOURCE_OPTIONS = [
  { value: "", label: "All sources" },
  { value: "google", label: "Google" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "social", label: "Social media" },
  { value: "direct", label: "Direct" },
  { value: "referral", label: "Referral" },
  { value: "paid", label: "Paid ads" },
  { value: "email", label: "Email" },
  { value: "other", label: "Other" },
];

function KpiCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  const theme = useTheme() as AppTheme;
  return (
    <Box sx={chatReportsKpiCardSx}>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 11 }}>
        {label}
      </Typography>
      <Typography fontWeight={700} sx={{ fontSize: 18, mt: 0.25 }}>
        {value}
      </Typography>
      {hint ? (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 10 }}>
          {hint}
        </Typography>
      ) : null}
    </Box>
  );
}

function pctLabel(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${value}%`;
}

function visitorEngagementLabel(row: WebsiteVisitorRow): string {
  if (row.hasLead) return "Lead captured";
  if (row.hasChatted) return "Chatted";
  if (row.widgetOpened) return "Opened widget";
  return "Browsed only";
}

function truncateUrl(url: string, max = 48): string {
  const t = url.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

const defaultRange = defaultReportRange();

export function WebsiteAnalyticsDashboard() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const { permissionsSyncing } = useAuth();
  const gates = useChatApiGates();
  const allowed = gates.reports;

  const scopeFilters = useChatScopeFilters(
    {
      dateFrom: isoToCalendarDate(defaultRange.from),
      dateTo: isoToCalendarDate(defaultRange.to),
    },
    { apiEnabled: allowed },
  );

  const websiteId = scopeFilters.filters.websiteId.trim();
  const from =
    calendarDateToIsoStart(scopeFilters.filters.dateFrom) || defaultRange.from;
  const to = calendarDateToIsoEnd(scopeFilters.filters.dateTo) || defaultRange.to;

  const [trafficSource, setTrafficSource] = useState("");
  const [leadsOnly, setLeadsOnly] = useState(false);
  const [chattedOnly, setChattedOnly] = useState(false);
  const [widgetOnly, setWidgetOnly] = useState(false);
  const [browsingOnly, setBrowsingOnly] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);

  useEffect(() => {
    if (!permissionsSyncing && !allowed) router.replace("/dashboard/chat-operations");
  }, [allowed, permissionsSyncing, router]);

  useEffect(() => {
    setPage(1);
  }, [websiteId, from, to, trafficSource, leadsOnly, chattedOnly, widgetOnly, browsingOnly, search]);

  const reportQuery = useQuery({
    queryKey: ["website-analytics-report", websiteId, from, to],
    queryFn: () => fetchWebsiteAnalyticsReport({ websiteId, from, to }),
    enabled: allowed && Boolean(websiteId),
    staleTime: 30_000,
  });

  const visitorsQuery = useQuery({
    queryKey: [
      "website-visitors",
      websiteId,
      from,
      to,
      page,
      trafficSource,
      leadsOnly,
      chattedOnly,
      widgetOnly,
      browsingOnly,
      search,
    ],
    queryFn: () =>
      fetchWebsiteVisitors({
        websiteId,
        from,
        to,
        page,
        limit: 25,
        trafficSource: trafficSource || undefined,
        hasLead: leadsOnly || undefined,
        hasChatted: chattedOnly || undefined,
        widgetOpened: widgetOnly ? true : browsingOnly ? false : undefined,
        search: search || undefined,
        sortBy: "lastSeenAt",
        sortDir: "desc",
      }),
    enabled: allowed && Boolean(websiteId),
    staleTime: 20_000,
  });

  const visitorDetailQuery = useQuery({
    queryKey: ["website-visitor-detail", websiteId, selectedVisitorId],
    queryFn: () => fetchWebsiteVisitorDetail(websiteId, selectedVisitorId!),
    enabled: Boolean(websiteId && selectedVisitorId),
  });

  const report = reportQuery.data;
  const sourceChart = useMemo(
    () => (report?.trafficSources ?? []).slice(0, 10),
    [report?.trafficSources],
  );
  const trendChart = useMemo(
    () => report?.dailyTrend ?? [],
    [report?.dailyTrend],
  );

  const visitorColumns = useMemo<DataTableColumn<WebsiteVisitorRow>[]>(
    () => [
      {
        id: "visitor",
        label: "Visitor",
        render: (_, row) => (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.name?.trim() || row.email?.trim() || "Site visitor"}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              {visitorEngagementLabel(row)}
              {row.email || row.phone ? ` · ${row.email || row.phone}` : " · No form"}
            </Typography>
          </Box>
        ),
      },
      {
        id: "source",
        label: "Source",
        render: (_, row) => (
          <Chip
            size="small"
            label={row.trafficSourceLabel}
            sx={{ fontSize: 11, height: 22 }}
          />
        ),
      },
      {
        id: "location",
        label: "Location / IP",
        render: (_, row) => (
          <Box>
            <Typography variant="body2">{row.location || "—"}</Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              {row.ipAddress || "IP unknown"}
            </Typography>
          </Box>
        ),
      },
      {
        id: "referrer",
        label: "Referrer / landing",
        render: (_, row) => (
          <Box sx={{ maxWidth: 220 }}>
            <Typography variant="caption" sx={{ display: "block" }} title={row.referrerUrl ?? ""}>
              {row.referrerUrl ? truncateUrl(row.referrerUrl, 42) : "Direct / none"}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: theme.app.dashboard.textMuted, display: "block" }}
              title={row.landingPageUrl ?? ""}
            >
              {row.landingPageUrl ? truncateUrl(row.landingPageUrl, 42) : "—"}
            </Typography>
          </Box>
        ),
      },
      {
        id: "engagement",
        label: "Engagement",
        render: (_, row) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            <Chip size="small" label={`${row.pageViewCount} views`} variant="outlined" />
            {row.widgetOpened ? (
              <Chip size="small" color="info" label="Opened widget" />
            ) : (
              <Chip size="small" variant="outlined" label="Browsed only" />
            )}
            {row.hasChatted ? <Chip size="small" color="success" label="Chat" /> : null}
            {row.hasLead ? <Chip size="small" color="warning" label="Lead" /> : null}
          </Box>
        ),
      },
      {
        id: "lastSeen",
        label: "Last seen",
        cellVariant: "muted",
        render: (_, row) => new Date(row.lastSeenAt).toLocaleString(),
      },
      {
        id: "actions",
        label: "",
        render: (_, row) => (
          <Button type="button" size="compact" variant="outlined" onClick={() => setSelectedVisitorId(row.id)}>
            Details
          </Button>
        ),
      },
    ],
    [theme.app.dashboard.textMuted],
  );

  if (!permissionsSyncing && !allowed) {
    return (
      <PermissionDeniedPanel
        title="Website analytics not available"
        description="Requires chat:report:view permission."
      />
    );
  }

  if (permissionsSyncing || !allowed) {
    return <Typography sx={{ py: 4 }}>Loading permissions…</Typography>;
  }

  return (
    <ChatLivePageShell>
      <ChatLivePageHeader
        title="Website analytics"
        subtitle="Traffic, sources, and leads for pages with the Converge widget script — visitors are counted on script load, not only when chat opens or a form is filled."
        navPreset="configure"
        trailing={
          <Button
            type="button"
            variant="outlined"
            onClick={() => {
              void reportQuery.refetch();
              void visitorsQuery.refetch();
            }}
          >
            Refresh
          </Button>
        }
      />

      <DashboardCard sx={{ flexShrink: 0, p: { xs: 1.5, md: 2 } }}>
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
          hint="Select reseller → parent → child → website, then pick the report date range."
        />
      </DashboardCard>

      {!websiteId ? (
        <Typography sx={{ color: theme.app.dashboard.textMuted, py: 2 }}>
          Choose a website above to load the full analytics report.
        </Typography>
      ) : reportQuery.isLoading ? (
        <Typography sx={{ color: theme.app.dashboard.textMuted }}>Loading report…</Typography>
      ) : reportQuery.isError ? (
        <Typography color="error">Could not load website analytics.</Typography>
      ) : report ? (
        <>
          <Box sx={{ mb: 1.5 }}>
            <Typography fontWeight={700} sx={{ fontSize: 16 }}>
              {report.website.name || report.website.url}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              {report.website.parentCompanyName} · {report.website.childCompanyName} ·{" "}
              {new Date(report.range.from).toLocaleDateString()} –{" "}
              {new Date(report.range.to).toLocaleDateString()}
            </Typography>
          </Box>

          <Box sx={chatReportsKpiGridSx}>
            <KpiCard
              label="Unique visitors"
              value={String(report.summary.uniqueVisitors)}
              hint={`${report.summary.pageViews.toLocaleString()} page views`}
            />
            <KpiCard
              label="Browsing only"
              value={String(report.summary.browsingOnlyVisitors ?? Math.max(0, report.summary.uniqueVisitors - report.summary.widgetOpens))}
              hint={pctLabel(report.summary.browsingOnlyRatePct) + " viewed site, no widget click"}
            />
            <KpiCard
              label="Widget opens"
              value={String(report.summary.widgetOpens)}
              hint={pctLabel(report.summary.widgetOpenRatePct) + " clicked chat launcher"}
            />
            <KpiCard
              label="Chats started"
              value={String(report.summary.chatsStarted)}
              hint={pctLabel(report.summary.chatRatePct) + " chat rate"}
            />
            <KpiCard
              label="Leads captured"
              value={String(report.summary.leadsCaptured)}
              hint={pctLabel(report.summary.leadRatePct) + " lead rate"}
            />
            <KpiCard label="Meaningful chats (QA)" value={String(report.summary.meaningfulChats)} />
            <KpiCard label="Chats without lead" value={String(report.summary.chatsWithoutLead)} />
          </Box>

          <Box
            sx={{
              ...chatReportsSectionSx,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              gap: 2,
            }}
          >
            <DashboardCard sx={{ p: 2, height: 300 }}>
              <Typography fontWeight={700} sx={{ fontSize: 14, mb: 1 }}>
                Traffic sources
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={sourceChart} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.app.dashboard.cardBorder} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="label" width={88} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="visitors" fill={theme.app.dashboard.accentBlue} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </DashboardCard>

            <DashboardCard sx={{ p: 2, height: 300 }}>
              <Typography fontWeight={700} sx={{ fontSize: 14, mb: 1 }}>
                Daily trend
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={trendChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.app.dashboard.cardBorder} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="visitors" stroke={theme.app.dashboard.accentCyan} dot={false} />
                  <Line type="monotone" dataKey="widgetOpens" stroke={theme.app.dashboard.accentPurple} dot={false} />
                  <Line type="monotone" dataKey="chats" stroke={theme.app.dashboard.accentGreen} dot={false} />
                  <Line type="monotone" dataKey="leads" stroke={theme.app.dashboard.accentOrange} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </DashboardCard>
          </Box>

          <Box
            sx={{
              ...chatReportsSectionSx,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            <GeoList title="Top countries" icon={<PublicOutlined fontSize="small" />} rows={report.topCountries.map((r) => ({ label: r.country, value: r.visitors }))} />
            <GeoList
              title="Top cities"
              icon={<LocationOnOutlined fontSize="small" />}
              rows={report.topCities.map((r) => ({ label: `${r.city}${r.country ? `, ${r.country}` : ""}`, value: r.visitors }))}
            />
            <GeoList
              title="Top landing pages"
              icon={<LanguageOutlined fontSize="small" />}
              rows={report.topLandingPages.map((r) => ({ label: truncateUrl(r.url, 36), value: r.visitors, title: r.url }))}
            />
          </Box>

          <Box sx={chatReportsSectionSx}>
            <Typography fontWeight={700} sx={{ fontSize: 14, mb: 1.5 }}>
              Visitors & leads
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "minmax(140px, 180px) repeat(4, auto) 1fr auto",
                },
                gap: 1,
                mb: 1.5,
                alignItems: "center",
              }}
            >
              <SelectField
                label="Source"
                value={trafficSource}
                onChange={setTrafficSource}
                options={TRAFFIC_SOURCE_OPTIONS}
              />
              <Button
                type="button"
                variant={leadsOnly ? "primary" : "outlined"}
                size="compact"
                onClick={() => setLeadsOnly((v) => !v)}
              >
                Leads only
              </Button>
              <Button
                type="button"
                variant={chattedOnly ? "primary" : "outlined"}
                size="compact"
                onClick={() => setChattedOnly((v) => !v)}
              >
                Chatted only
              </Button>
              <Button
                type="button"
                variant={widgetOnly ? "primary" : "outlined"}
                size="compact"
                onClick={() => {
                  setWidgetOnly((v) => {
                    const next = !v;
                    if (next) setBrowsingOnly(false);
                    return next;
                  });
                }}
              >
                Widget opened
              </Button>
              <Button
                type="button"
                variant={browsingOnly ? "primary" : "outlined"}
                size="compact"
                onClick={() => {
                  setBrowsingOnly((v) => {
                    const next = !v;
                    if (next) setWidgetOnly(false);
                    return next;
                  });
                }}
              >
                Browsing only
              </Button>
              <InputField
                label="Search name, email, IP, city…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSearch(searchInput.trim());
                }}
              />
              <Button type="button" size="compact" variant="outlined" onClick={() => setSearch(searchInput.trim())}>
                Search
              </Button>
            </Box>

            {visitorsQuery.isLoading ? (
              <Typography sx={{ color: theme.app.dashboard.textMuted }}>Loading visitors…</Typography>
            ) : (
              <>
                <DataTable columns={visitorColumns} rows={visitorsQuery.data?.items ?? []} size="small" />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1.5 }}>
                  <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                    {visitorsQuery.data?.total ?? 0} visitors in range
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      type="button"
                      size="compact"
                      variant="outlined"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Typography variant="caption" sx={{ alignSelf: "center" }}>
                      Page {page} / {visitorsQuery.data?.totalPages ?? 1}
                    </Typography>
                    <Button
                      type="button"
                      size="compact"
                      variant="outlined"
                      disabled={page >= (visitorsQuery.data?.totalPages ?? 1)}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </>
      ) : null}

      <Drawer
        anchor="right"
        open={Boolean(selectedVisitorId)}
        onClose={() => setSelectedVisitorId(null)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 420 }, p: 2 } }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography fontWeight={700}>Visitor detail</Typography>
          <IconButton aria-label="Close" onClick={() => setSelectedVisitorId(null)}>
            <CloseOutlined />
          </IconButton>
        </Box>
        {visitorDetailQuery.isLoading ? (
          <Typography sx={{ color: theme.app.dashboard.textMuted }}>Loading…</Typography>
        ) : visitorDetailQuery.data ? (
          <VisitorDetailBody detail={visitorDetailQuery.data} />
        ) : null}
      </Drawer>
    </ChatLivePageShell>
  );
}

function GeoList({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: React.ReactNode;
  rows: Array<{ label: string; value: number; title?: string }>;
}) {
  const theme = useTheme() as AppTheme;
  return (
    <DashboardCard sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
        {icon}
        <Typography fontWeight={700} sx={{ fontSize: 14 }}>
          {title}
        </Typography>
      </Box>
      {rows.length === 0 ? (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          No data in this range.
        </Typography>
      ) : (
        rows.map((row) => (
          <Box
            key={row.label}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 1,
              py: 0.5,
              borderBottom: `1px solid ${theme.app.dashboard.cardBorder}`,
            }}
          >
            <Typography variant="body2" title={row.title ?? row.label} sx={{ minWidth: 0 }}>
              {row.label}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {row.value}
            </Typography>
          </Box>
        ))
      )}
    </DashboardCard>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  const theme = useTheme() as AppTheme;
  if (!value?.trim()) return null;
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
        {value}
      </Typography>
    </Box>
  );
}

function VisitorDetailBody({ detail }: { detail: Record<string, unknown> }) {
  const pageHistory = Array.isArray(detail.pageHistory)
    ? (detail.pageHistory as Array<{ pageUrl?: string; visitedAt?: string }>)
    : [];

  return (
    <Box>
      <DetailRow
        label="Engagement"
        value={
          detail.widgetOpened === true
            ? detail.hasChatted === true
              ? "Opened widget · chatted"
              : "Opened widget"
            : "Browsed only (no widget click)"
        }
      />
      <DetailRow label="Name" value={String(detail.name ?? "")} />
      <DetailRow label="Email" value={String(detail.email ?? "")} />
      <DetailRow label="Phone" value={String(detail.phone ?? "")} />
      <DetailRow label="IP" value={String(detail.ipAddress ?? "")} />
      <DetailRow label="ISP" value={String(detail.isp ?? "")} />
      <DetailRow label="Location" value={String(detail.location ?? "")} />
      <DetailRow label="Timezone" value={String(detail.timezone ?? "")} />
      <DetailRow label="Source" value={String(detail.trafficSourceLabel ?? detail.trafficSource ?? "")} />
      <DetailRow label="Referrer" value={String(detail.referrerUrl ?? "")} />
      <DetailRow label="Landing page" value={String(detail.landingPageUrl ?? "")} />
      <DetailRow
        label="UTM"
        value={
          [detail.utmSource, detail.utmMedium, detail.utmCampaign].filter(Boolean).join(" / ") || undefined
        }
      />
      <DetailRow label="Device" value={String(detail.deviceType ?? "")} />
      <DetailRow label="Browser" value={String(detail.browser ?? "")} />
      <DetailRow label="OS" value={String(detail.os ?? "")} />
      <DetailRow label="User agent" value={String(detail.userAgent ?? "")} />
      <DetailRow label="First seen" value={detail.firstSeenAt ? new Date(String(detail.firstSeenAt)).toLocaleString() : ""} />
      <DetailRow label="Last seen" value={detail.lastSeenAt ? new Date(String(detail.lastSeenAt)).toLocaleString() : ""} />

      {pageHistory.length > 0 ? (
        <Box sx={{ mt: 2 }}>
          <Typography fontWeight={600} sx={{ fontSize: 13, mb: 0.5 }}>
            Page history
          </Typography>
          {pageHistory.slice(0, 12).map((p, i) => (
            <Typography key={i} variant="caption" sx={{ display: "block", mb: 0.35 }}>
              {p.visitedAt ? new Date(p.visitedAt).toLocaleString() : ""} — {p.pageUrl}
            </Typography>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}
