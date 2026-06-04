"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  DataTable,
  FormModal,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { useCompanySetupDraftsListQuery } from "@/lib/hooks/query";
import {
  formatSetupDraftWhen,
  parseCompanySetupDraftsList,
  type CompanySetupDraftListItem,
} from "@/lib/companies/setup-drafts-list.utils";
import { departmentsCard } from "../../website-assigning/website-assigning.styles";

export type CompanySetupDraftsModalProps = {
  open: boolean;
  onClose: () => void;
  onResume: (draftId: string) => void;
  onStartNew: () => void;
  startingNew?: boolean;
};

export function CompanySetupDraftsModal({
  open,
  onClose,
  onResume,
  onStartNew,
  startingNew = false,
}: CompanySetupDraftsModalProps) {
  const theme = useTheme() as AppTheme;
  const draftsQuery = useCompanySetupDraftsListQuery({ enabled: open });

  const rows = useMemo(
    () => parseCompanySetupDraftsList(draftsQuery.data),
    [draftsQuery.data],
  );

  const columns = useMemo<DataTableColumn<CompanySetupDraftListItem>[]>(
    () => [
      {
        id: "label",
        label: "Setup",
        render: (_v, row) => (
          <Box>
            <Typography variant="medium" color="white" fontWeight={600}>
              {row.label}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              {row.stepLabel}
              {row.childCount > 0 ? ` · ${row.childCount} child${row.childCount === 1 ? "" : "ren"}` : ""}
            </Typography>
          </Box>
        ),
      },
      {
        id: "status",
        label: "Status",
        render: (_v, row) => (
          <Chip
            size="small"
            label={row.status.replace(/_/g, " ")}
            sx={{
              textTransform: "capitalize",
              bgcolor: alpha(theme.app.dashboard.accentBlue, 0.14),
              color: theme.app.dashboard.accentBlue,
              border: `1px solid ${alpha(theme.app.dashboard.accentBlue, 0.35)}`,
            }}
          />
        ),
      },
      {
        id: "updatedAt",
        label: "Last saved",
        render: (_v, row) => (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            {formatSetupDraftWhen(row.updatedAt)}
          </Typography>
        ),
      },
      {
        id: "expiresAt",
        label: "Expires",
        render: (_v, row) => (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            {formatSetupDraftWhen(row.expiresAt)}
          </Typography>
        ),
      },
    ],
    [theme],
  );

  return (
    <FormModal
      open={open}
      title="Company setup drafts"
      description="In-progress setups you started. Resume to continue, or start a new reseller / company flow."
      onClose={onClose}
      onSave={onClose}
      primaryButtonLabel="Close"
      showCancelButton={false}
      maxWidth={920}
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="secondary" onClick={onStartNew} disabled={startingNew}>
          {startingNew ? "Starting…" : "New setup"}
        </Button>
      </Box>
      <DashboardCard sx={{ ...departmentsCard, p: 0, overflow: "hidden" }}>
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          isLoading={draftsQuery.isLoading}
          actionColumn={{
            label: "",
            align: "right",
            render: (row) => (
              <Button
                variant="primary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onResume(row.id);
                  onClose();
                }}
              >
                Resume
              </Button>
            ),
          }}
          emptyState={{
            title: draftsQuery.isError ? "Could not load drafts" : "No drafts yet",
            description: draftsQuery.isError
              ? "Try again in a moment."
              : "Use Add Reseller / Company to start a new setup. Progress is saved automatically.",
          }}
        />
      </DashboardCard>
    </FormModal>
  );
}
