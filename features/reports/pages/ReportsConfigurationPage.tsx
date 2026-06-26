"use client";

import { useMemo, useState } from "react";
import Add from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ShareIcon from "@mui/icons-material/Share";
import HistoryIcon from "@mui/icons-material/History";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  DataTable,
  FormModal,
  PermissionDeniedPanel,
  Typography,
  dataTableActionButton,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import type { ReportConfiguration, GeneratedReportListItem } from "@/api/reports/reports.types";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { getApiBaseUrl } from "@/api/config";
import { REPORT_TYPE_LABELS } from "../reports.constants";
import { ReportConfigurationFormModal } from "../components/ReportConfigurationFormModal";
import { GenerateReportModal } from "../components/GenerateReportModal";
import { ShareReportModal } from "../components/ShareReportModal";
import {
  useCreateReportConfigurationMutation,
  useDeleteReportConfigurationMutation,
  useGenerateReportMutation,
  useGeneratedReportsQuery,
  useReportConfigurationsQuery,
  useShareGeneratedReportMutation,
  useUpdateReportConfigurationMutation,
} from "../hooks/useReportsQueries";

type ConfigRow = ReportConfiguration & Record<string, unknown>;

function formatScopeSummary(scope: ReportConfiguration["scope"]): string {
  const parts: string[] = [];
  if (scope.websiteId) parts.push("Website");
  else if (scope.companyId) parts.push("Child company");
  else if (scope.parentCompanyId) parts.push("Parent company");
  else if (scope.resellerId) parts.push("Reseller");
  return parts.join(", ") || "—";
}

function formatScheduleSummary(config: ReportConfiguration): string {
  const schedule = config.schedules[0];
  if (!schedule) return "—";
  const type = schedule.scheduleType ?? "—";
  const time = schedule.scheduleTime ?? "";
  if (schedule.scheduleType === "weekly") {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const day = schedule.dayOfWeek != null ? days[schedule.dayOfWeek] : "—";
    return `${type} · ${day} · ${time}${schedule.isActive ? "" : " (inactive)"}`;
  }
  return `${type} · day ${schedule.dayOfMonth ?? "—"} · ${time}${schedule.isActive ? "" : " (inactive)"}`;
}

function GeneratedReportsPanel({ configId }: { configId: string }) {
  const theme = useTheme() as AppTheme;
  const generatedQuery = useGeneratedReportsQuery(configId, true);
  const shareMutation = useShareGeneratedReportMutation();
  const [shareTarget, setShareTarget] = useState<GeneratedReportListItem | null>(null);
  const apiBase = getApiBaseUrl().replace(/\/$/, "");

  const rows = generatedQuery.data ?? [];

  if (generatedQuery.isLoading) {
    return (
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, p: 1.5, display: "block" }}>
        Loading generated reports…
      </Typography>
    );
  }

  if (rows.length === 0) {
    return (
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, p: 1.5, display: "block" }}>
        No generated reports yet for this configuration.
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 1.5, bgcolor: theme.app.dashboard.cardBg, borderRadius: 1 }}>
      {rows.map((item) => (
        <Box
          key={item.id}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            py: 0.75,
            borderBottom: `1px solid ${theme.app.dashboard.shellBorder}`,
            "&:last-child": { borderBottom: 0 },
          }}
        >
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {new Date(item.generatedAt).toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              {item.format ?? "json"} · {item.generatedBy ?? "system"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {item.reportFileUrl ? (
              <Box
                component="a"
                href={`${apiBase}${item.reportFileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  fontSize: 13,
                  px: 1.25,
                  py: 0.5,
                  borderRadius: 1,
                  border: `1px solid ${theme.app.dashboard.shellBorder}`,
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                Download
              </Box>
            ) : null}
            <IconButton
              size="small"
              aria-label="Share report"
              sx={dataTableActionButton}
              onClick={() => setShareTarget(item)}
            >
              <ShareIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      ))}
      <ShareReportModal
        open={Boolean(shareTarget)}
        onClose={() => setShareTarget(null)}
        submitting={shareMutation.isPending}
        onSubmit={async (body) => {
          if (!shareTarget) return;
          try {
            const result = await shareMutation.mutateAsync({ id: shareTarget.id, body });
            publishAppToast({
              variant: "success",
              message: `Report shared (${result.sent} sent, ${result.failed} failed).`,
            });
            setShareTarget(null);
          } catch (err) {
            publishAppToast({
              variant: "error",
              message: extractApiErrorMessageForToast(err, "Failed to share report."),
            });
          }
        }}
      />
    </Box>
  );
}

export function ReportsConfigurationPage() {
  const theme = useTheme() as AppTheme;
  const { hasOperational } = useAuth();
  const canView = hasOperational(OP.report.view);

  const listQuery = useReportConfigurationsQuery(canView);
  const createMutation = useCreateReportConfigurationMutation();
  const updateMutation = useUpdateReportConfigurationMutation();
  const deleteMutation = useDeleteReportConfigurationMutation();
  const generateMutation = useGenerateReportMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ReportConfiguration | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ConfigRow | null>(null);
  const [generateTarget, setGenerateTarget] = useState<ReportConfiguration | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const columns = useMemo<DataTableColumn<ConfigRow>[]>(
    () => [
      {
        id: "reportType",
        label: "Report type",
        render: (_v, row) => REPORT_TYPE_LABELS[row.reportType] ?? row.reportType,
      },
      {
        id: "scope",
        label: "Scope",
        render: (_v, row) => formatScopeSummary(row.scope),
      },
      {
        id: "recipients",
        label: "Recipients",
        render: (_v, row) => row.recipients.map((r) => r.email).join(", ") || "—",
      },
      {
        id: "schedule",
        label: "Schedule",
        render: (_v, row) => formatScheduleSummary(row),
      },
      {
        id: "createdAt",
        label: "Created",
        render: (_v, row) => new Date(row.createdAt).toLocaleDateString(),
      },
      {
        id: "actions",
        label: "Actions",
        render: (_v, row) => (
          <Box sx={{ display: "flex", gap: 0.25 }}>
            <IconButton
              size="small"
              aria-label="Generate report"
              sx={dataTableActionButton}
              onClick={() => setGenerateTarget(row)}
            >
              <PlayArrowIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              aria-label="View generated reports"
              sx={dataTableActionButton}
              onClick={() => setExpandedId((prev) => (prev === row.id ? null : row.id))}
            >
              <HistoryIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              aria-label="Edit configuration"
              sx={dataTableActionButton}
              onClick={() => {
                setEditTarget(row);
                setFormOpen(true);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              aria-label="Delete configuration"
              sx={dataTableActionButton}
              onClick={() => setDeleteTarget(row)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [],
  );

  const rows = useMemo<ConfigRow[]>(
    () => (listQuery.data ?? []).map((row) => ({ ...row })),
    [listQuery.data],
  );

  if (!canView) {
    return (
      <PermissionDeniedPanel
        title="Reports access required"
        description="Requires page:reports and report:view from /auth/me."
      />
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Reports Configuration
          </Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            Schedule, generate, and share monthly chat summary reports.
          </Typography>
        </Box>
        <Button
          type="button"
          variant="primary"
          sx={gradientPrimaryButtonSx}
          startIcon={<Add />}
          onClick={() => {
            setEditTarget(null);
            setFormOpen(true);
          }}
        >
          New configuration
        </Button>
      </Box>

      <DashboardCard sx={{ p: { xs: 1, md: 2 } }}>
        {listQuery.isLoading ? (
          <Typography sx={{ color: theme.app.dashboard.textMuted, p: 2 }}>Loading configurations…</Typography>
        ) : listQuery.isError ? (
          <Typography color="error" sx={{ p: 2 }}>
            {listQuery.error instanceof Error
              ? listQuery.error.message
              : "Unable to load configurations."}
          </Typography>
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(row) => row.id}
              emptyState={{
                title: "No configurations",
                description: "Create a configuration to schedule automated reports.",
              }}
            />
            {rows.map((row) => (
              <Collapse key={`history-${row.id}`} in={expandedId === row.id} unmountOnExit>
                <GeneratedReportsPanel configId={row.id} />
              </Collapse>
            ))}
          </>
        )}
      </DashboardCard>

      <ReportConfigurationFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
        }}
        configuration={editTarget}
        submitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={async (payload) => {
          try {
            if (editTarget) {
              await updateMutation.mutateAsync({
                id: editTarget.id,
                body: {
                  ...payload.scope,
                  reportType: payload.reportType as ReportConfiguration["reportType"],
                  recipients: payload.recipients,
                  schedule: payload.schedule,
                },
              });
              publishAppToast({ variant: "success", message: "Configuration updated." });
            } else {
              await createMutation.mutateAsync({
                ...payload.scope,
                reportType: payload.reportType as ReportConfiguration["reportType"],
                recipients: payload.recipients,
                schedule: payload.schedule,
              });
              publishAppToast({ variant: "success", message: "Configuration created." });
            }
            setFormOpen(false);
            setEditTarget(null);
          } catch (err) {
            publishAppToast({
              variant: "error",
              message: extractApiErrorMessageForToast(err, "Failed to save configuration."),
            });
          }
        }}
      />

      <GenerateReportModal
        open={Boolean(generateTarget)}
        onClose={() => setGenerateTarget(null)}
        configLabel={generateTarget ? REPORT_TYPE_LABELS[generateTarget.reportType] : undefined}
        submitting={generateMutation.isPending}
        onSubmit={async (body) => {
          if (!generateTarget) return;
          try {
            const result = await generateMutation.mutateAsync({ id: generateTarget.id, body });
            publishAppToast({
              variant: "success",
              message: `Report generated${result.delivery.sent ? ` and emailed (${result.delivery.sent} sent)` : ""}.`,
            });
            setGenerateTarget(null);
            setExpandedId(generateTarget.id);
          } catch (err) {
            publishAppToast({
              variant: "error",
              message: extractApiErrorMessageForToast(err, "Failed to generate report."),
            });
          }
        }}
      />

      <FormModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete configuration"
        description="Delete this report configuration? Saved schedules and recipient lists will be removed."
        primaryButtonLabel={deleteMutation.isPending ? "Deleting…" : "Delete"}
        primaryButtonVariant="danger"
        primaryButtonDisabled={deleteMutation.isPending}
        onSave={() => {
          if (!deleteTarget) return;
          void deleteMutation
            .mutateAsync(deleteTarget.id)
            .then(() => {
              publishAppToast({ variant: "success", message: "Configuration deleted." });
              setDeleteTarget(null);
            })
            .catch((err) => {
              publishAppToast({
                variant: "error",
                message: extractApiErrorMessageForToast(err, "Failed to delete configuration."),
              });
            });
        }}
      />
    </Box>
  );
}
