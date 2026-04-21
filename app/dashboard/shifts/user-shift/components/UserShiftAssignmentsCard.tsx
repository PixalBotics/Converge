"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, DataTable, dataTableActionButton, Typography } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { rolesCard, rolesIconBox } from "@/app/dashboard/roles/roles.styles";
import { footerMutedText } from "@/app/dashboard/companies/overview.styles";
import { userShiftIconSx } from "../user-shift.styles";

export type UserShiftAssignmentRow = {
  id: string;
  shiftName: string;
  effectiveFrom: string;
  effectiveTo: string;
};

export type UserShiftAssignmentsCardProps = {
  selectedUserTypeLabel: string | null;
  hasSelectedUser: boolean;
  isLoading: boolean;
  rows: UserShiftAssignmentRow[];
  columns: DataTableColumn<UserShiftAssignmentRow>[];
  onRemove: (row: UserShiftAssignmentRow) => void;
  isRemoving: boolean;
};

export function UserShiftAssignmentsCard({
  selectedUserTypeLabel,
  hasSelectedUser,
  isLoading,
  rows,
  columns,
  onRemove,
  isRemoving,
}: UserShiftAssignmentsCardProps) {
  const theme = useTheme() as AppTheme;

  return (
    <DashboardCard sx={rolesCard}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <Box sx={rolesIconBox}>
            <AttachMoneyIcon sx={userShiftIconSx} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="mediumLarge" fontWeight={700} color="white" noWrap>
              Assignments
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }} noWrap>
              {hasSelectedUser ? "Effective dates show when the shift is active" : "Select a user to view assignments"}
            </Typography>
          </Box>
        </Box>
        {selectedUserTypeLabel ? (
          <Typography
            variant="body2"
            sx={{
              color: selectedUserTypeLabel === "External" ? theme.app.dashboard.accentRedLight : theme.app.dashboard.accentGreenLight,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {selectedUserTypeLabel}
          </Typography>
        ) : null}
      </Box>

      <DataTable<UserShiftAssignmentRow>
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        minWidth={720}
        actionColumn={{
          label: "Action",
          render: (row) => (
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <IconButton
                size="small"
                sx={{
                  ...dataTableActionButton,
                  color: theme.app.dashboard.accentRedLight,
                  opacity: isRemoving ? 0.7 : 1,
                }}
                aria-label="Remove assignment"
                disabled={isRemoving}
                onClick={() => onRemove(row)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ),
        }}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
        <Typography variant="medium" sx={footerMutedText(theme)}>
          {!hasSelectedUser ? "Select a user to view assignments." : isLoading ? "Loading…" : `Total ${rows.length} assignment(s)`}
        </Typography>
        <Box />
      </Box>
    </DashboardCard>
  );
}

