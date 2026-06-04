"use client";

import { useCallback, useMemo } from "react";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import EditOutlined from "@mui/icons-material/EditOutlined";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DataTable, dataTableActionButton } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import type { QaRosterListRow } from "@/services/chat/qa-roster.api";
import {
  fetchQaWebsiteRoster,
  useSaveQaRosterWebsiteMutation,
} from "../hooks/useQaRosterList";
import { qaRosterAssignHref } from "../utils/qa-assign-href";

function userLabel(row: QaRosterListRow): string {
  const u = row.user;
  if (!u) return row.userId.slice(0, 8);
  const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  if (name) return u.email ? `${name} · ${u.email}` : name;
  return u.email ?? row.userId.slice(0, 8);
}

type QaRosterListTableProps = {
  rows: QaRosterListRow[];
  isLoading: boolean;
  isError: boolean;
  hasActiveFilters: boolean;
  canEdit: boolean;
  onEditRow: (row: QaRosterListRow) => void;
};

export function QaRosterListTable({
  rows,
  isLoading,
  isError,
  hasActiveFilters,
  canEdit,
  onEditRow,
}: QaRosterListTableProps) {
  const theme = useTheme() as AppTheme;
  const saveMutation = useSaveQaRosterWebsiteMutation();

  const removeRow = useCallback(async (row: QaRosterListRow) => {
    try {
      const roster = await fetchQaWebsiteRoster(row.websiteId);
      const internal = roster.internal.map((r) => r.userId);
      const external = roster.external.map((r) => r.userId);
      const channel = row.channelScope;
      await saveMutation.mutateAsync({
        websiteId: row.websiteId,
        internalUserIds:
          channel === "internal" ? internal.filter((id) => id !== row.userId) : internal,
        externalUserIds:
          channel === "external" ? external.filter((id) => id !== row.userId) : external,
      });
      publishAppToast({ message: "QA reviewer removed.", variant: "success" });
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err, "Could not remove reviewer."),
        variant: "error",
      });
    }
  }, [saveMutation]);

  const columns = useMemo<DataTableColumn<QaRosterListRow>[]>(
    () => [
      {
        id: "website",
        label: "Website",
        render: (_, row) => (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.35, minWidth: 0 }}>
            <Box
              component="button"
              type="button"
              onClick={() => onEditRow(row)}
              sx={{
                border: "none",
                bgcolor: "transparent",
                p: 0,
                m: 0,
                textAlign: "left",
                cursor: "pointer",
                color: theme.app.dashboard.accentBlue,
                fontWeight: 600,
                fontSize: 14,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {row.website.websiteName || row.website.websiteUrl || row.websiteId.slice(0, 8)}
            </Box>
            <Box
              component="span"
              sx={{
                color: theme.app.dashboard.textMuted,
                fontSize: 12,
                wordBreak: "break-all",
                lineHeight: 1.45,
              }}
            >
              {row.website.websiteUrl || "—"}
            </Box>
          </Box>
        ),
      },
      {
        id: "reseller",
        label: "Reseller",
        render: (_, row) => row.website.resellerName || "—",
      },
      {
        id: "parent",
        label: "Parent",
        render: (_, row) => row.website.parentCompanyName || "—",
      },
      {
        id: "child",
        label: "Child",
        render: (_, row) => row.website.childCompanyName || "—",
      },
      {
        id: "channel",
        label: "Channel",
        render: (_, row) => (
          <Chip
            label={row.channelScope === "external" ? "External" : "Internal"}
            size="small"
            variant="outlined"
            sx={{ height: 22, fontSize: 11 }}
          />
        ),
      },
      {
        id: "reviewer",
        label: "QA reviewer",
        render: (_, row) => userLabel(row),
      },
      ...(canEdit
        ? [
            {
              id: "actions",
              label: "",
              render: (_: unknown, row: QaRosterListRow) => (
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                  <Tooltip title="Edit reviewers for this website">
                    <IconButton
                      size="small"
                      sx={dataTableActionButton}
                      aria-label="Edit QA roster"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditRow(row);
                      }}
                    >
                      <EditOutlined fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remove this reviewer">
                    <IconButton
                      size="small"
                      sx={{
                        ...dataTableActionButton,
                        color: theme.app.dashboard.accentRedLight,
                      }}
                      aria-label="Remove reviewer"
                      disabled={saveMutation.isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        void removeRow(row);
                      }}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ),
            },
          ]
        : []),
    ],
    [canEdit, onEditRow, removeRow, saveMutation.isPending, theme],
  );

  return (
    <DataTable<QaRosterListRow>
      columns={columns}
      rows={rows}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      emptyState={{
        title: isError ? "Could not load" : "No QA reviewers assigned",
        description: isError
          ? "Check permissions and try again."
          : hasActiveFilters
            ? "No assignments match these filters. Clear filters or assign reviewers."
            : "Click Assign QA reviewers to pick a website and add internal or external QA staff.",
      }}
    />
  );
}
