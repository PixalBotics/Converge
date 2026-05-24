"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Chip from "@mui/material/Chip";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  DataTable,
  PermissionDeniedPanel,
  SearchBar,
  SelectField,
  TablePagination,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { PAGE } from "@/lib/permissions/permission-constants";
import {
  ChatScopeFiltersPanel,
  useChatScopeFilters,
} from "@/features/chat-shared";
import type { AuditLogListItem, AnalyticsLogListItem } from "@/api/observability/observability-logs.types";
import { useObservabilityLogs } from "../hooks/useObservabilityLogs";
import {
  formatLogActor,
  formatLogTimestamp,
  formatLogWebsiteLabel,
} from "../utils/format-log";
import { LogDetailDrawer } from "./LogDetailDrawer";

function severityColor(
  severity: string,
): "default" | "warning" | "error" | "info" {
  const s = severity.toLowerCase();
  if (s === "error" || s === "critical") return "error";
  if (s === "warn" || s === "warning") return "warning";
  if (s === "info") return "info";
  return "default";
}

export function SettingsLogsWorkspace() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { hasPage, isPlatformAdmin, permissionsSyncing } = useAuth();
  const allowed =
    isPlatformAdmin ||
    hasPage(PAGE.OBSERVABILITY_LOGS);
  const logs = useObservabilityLogs({ apiEnabled: allowed });
  const scopeFilters = useChatScopeFilters({}, { apiEnabled: allowed });
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    if (!permissionsSyncing && !allowed) {
      router.replace("/dashboard/settings");
    }
  }, [allowed, permissionsSyncing, router]);

  const { setWebsiteId, setPage } = logs;

  useEffect(() => {
    setWebsiteId(scopeFilters.filters.websiteId);
    setPage(1);
  }, [scopeFilters.filters.websiteId, setWebsiteId, setPage]);

  const auditColumns = useMemo<DataTableColumn<AuditLogListItem>[]>(
    () => [
      {
        id: "createdAt",
        label: "Time",
        render: (_, row) => formatLogTimestamp(row.createdAt),
      },
      { id: "eventType", label: "Event" },
      {
        id: "severity",
        label: "Severity",
        render: (value) => (
          <Chip
            size="small"
            label={String(value ?? "")}
            color={severityColor(String(value ?? ""))}
            variant="outlined"
          />
        ),
      },
      {
        id: "actor",
        label: "Actor",
        render: (_, row) => formatLogActor(row.actor),
      },
      {
        id: "website",
        label: "Website",
        render: (_, row) => formatLogWebsiteLabel(row.website),
      },
    ],
    [],
  );

  const analyticsColumns = useMemo<DataTableColumn<AnalyticsLogListItem>[]>(
    () => [
      {
        id: "createdAt",
        label: "Time",
        render: (_, row) => formatLogTimestamp(row.createdAt),
      },
      { id: "eventType", label: "Event" },
      {
        id: "actor",
        label: "Actor",
        render: (_, row) => formatLogActor(row.actor),
      },
      {
        id: "website",
        label: "Website",
        render: (_, row) => formatLogWebsiteLabel(row.website),
      },
    ],
    [],
  );

  if (!permissionsSyncing && !allowed) {
    return <PermissionDeniedPanel />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: { xs: 1.5, md: 2.5 }, minHeight: 0 }}>
      <Box>
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          Settings › System logs
        </Typography>
        <Typography variant="h6" fontWeight={600} color="white" sx={{ mt: 0.5 }}>
          System logs
        </Typography>
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 0.5 }}>
          Platform audit and analytics events. Retention: {logs.retentionDays} days.
        </Typography>
      </Box>

      <DashboardCard sx={{ p: 2, height: "auto" }}>
        <ChatScopeFiltersPanel
          compact
          filters={scopeFilters.filters}
          onPatch={scopeFilters.patchFilters}
          onReset={scopeFilters.resetFilters}
          canFilterByResellerId={scopeFilters.canFilterByResellerId}
          resellerOptions={scopeFilters.resellerOptions}
          parentCompanyOptions={scopeFilters.parentCompanyOptions}
          childCompanyOptions={scopeFilters.childCompanyOptions}
          websiteOptions={scopeFilters.websiteOptions}
        />
      </DashboardCard>

      <DashboardCard sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, p: 2 }}>
        <Tabs
          value={logs.tab}
          onChange={(_, v) => logs.setTab(v)}
          sx={{ borderBottom: 1, borderColor: "divider", mb: 2, flexShrink: 0 }}
        >
          <Tab value="audit" label="Audit" />
          <Tab value="analytics" label="Analytics" />
        </Tabs>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            mb: 2,
            alignItems: "flex-end",
          }}
        >
          <Box sx={{ minWidth: 200, flex: "1 1 200px" }}>
            <SearchBar
              placeholder="Event type"
              value={logs.eventType}
              onChange={(v) => {
                logs.setEventType(v);
                logs.setPage(1);
              }}
            />
          </Box>
          {logs.tab === "audit" ? (
            <Box sx={{ minWidth: 140 }}>
              <SelectField
                label="Severity"
                value={logs.severity}
                onChange={(v) => {
                  logs.setSeverity(v);
                  logs.setPage(1);
                }}
                options={[
                  { value: "", label: "All" },
                  { value: "info", label: "Info" },
                  { value: "warn", label: "Warn" },
                  { value: "error", label: "Error" },
                ]}
              />
            </Box>
          ) : null}
          <Button type="button" variant="secondary" onClick={() => logs.refresh()}>
            Refresh
          </Button>
        </Box>

        {logs.loading ? (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            Loading logs…
          </Typography>
        ) : logs.tab === "audit" ? (
          <>
            <DataTable<AuditLogListItem>
              columns={auditColumns}
              rows={logs.auditItems}
              getRowId={(row) => row.id}
              onRowClick={(row) => setDetailId(row.id)}
              minWidth={640}
            />
            <Box sx={{ mt: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                {logs.total} entries
              </Typography>
              <TablePagination
                page={logs.page}
                pageCount={Math.max(1, logs.totalPages)}
                onPageChange={logs.setPage}
              />
            </Box>
          </>
        ) : (
          <>
            <DataTable<AnalyticsLogListItem>
              columns={analyticsColumns}
              rows={logs.analyticsItems}
              getRowId={(row) => row.id}
              onRowClick={(row) => setDetailId(row.id)}
              minWidth={640}
            />
            <Box sx={{ mt: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                {logs.total} entries
              </Typography>
              <TablePagination
                page={logs.page}
                pageCount={Math.max(1, logs.totalPages)}
                onPageChange={logs.setPage}
              />
            </Box>
          </>
        )}
      </DashboardCard>

      <LogDetailDrawer
        open={Boolean(detailId)}
        logId={detailId}
        tab={logs.tab}
        onClose={() => setDetailId(null)}
      />
    </Box>
  );
}
