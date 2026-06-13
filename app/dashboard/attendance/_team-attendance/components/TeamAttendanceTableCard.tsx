"use client";

import Box from "@mui/material/Box";
import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  Calendar,
  DashboardCard,
  DataTable,
  SearchBar,
  TablePagination,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { rolesCard, rolesFooterRow, rolesPaginationWrapper } from "@/app/dashboard/roles/roles.styles";
import { footerMutedText } from "@/app/dashboard/companies/overview.styles";
import {
  approvalLeaveCardHeaderSx,
  approvalLeaveIconSx,
  approvalLeaveSearchWrapSx,
  approvalLeaveTitleRowSx,
  approvalLeaveToolbarSx,
} from "@/app/dashboard/leave/_approval-leave/approval-leave.styles";
import type { TeamAttendanceScope } from "../utils/attendance-scope";
import type { TeamAttendanceTableRow } from "../utils/attendance-rows";
import { EmptyAttendanceState } from "../../components/EmptyAttendanceState";

export type TeamAttendanceTableCardProps = {
  scope: TeamAttendanceScope;
  onScopeChange: (scope: TeamAttendanceScope) => void;
  search: string;
  onSearchChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  footerText: string;
  isLoading: boolean;
  rows: TeamAttendanceTableRow[];
  columns: DataTableColumn<TeamAttendanceTableRow>[];
  canUseTeamMembers: boolean;
  canUsePoolHeads: boolean;
  canUseDepartmentHeads: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
};

export function TeamAttendanceTableCard({
  scope,
  onScopeChange,
  search,
  onSearchChange,
  date,
  onDateChange,
  page,
  pageCount,
  onPageChange,
  footerText,
  isLoading,
  rows,
  columns,
  canUseTeamMembers,
  canUsePoolHeads,
  canUseDepartmentHeads,
  emptyTitle,
  emptySubtitle,
}: TeamAttendanceTableCardProps) {
  const theme = useTheme() as AppTheme;
  const visibleTabCount = [canUseTeamMembers, canUsePoolHeads, canUseDepartmentHeads].filter(Boolean).length;

  return (
    <DashboardCard sx={rolesCard}>
      <Box sx={approvalLeaveCardHeaderSx}>
        <Box sx={approvalLeaveTitleRowSx}>
          <Box sx={approvalLeaveIconSx}>
            <AccessTimeRounded sx={{ fontSize: 14 }} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Attendance records
          </Typography>
        </Box>

        <Box sx={approvalLeaveToolbarSx}>
          {visibleTabCount > 0 ? (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {canUseTeamMembers ? (
                <Button
                  type="button"
                  variant={scope === "team_members" ? "primary" : "secondary"}
                  onClick={() => onScopeChange("team_members")}
                  sx={scope === "team_members" ? gradientPrimaryButtonSx : undefined}
                >
                  Team members
                </Button>
              ) : null}
              {canUsePoolHeads ? (
                <Button
                  type="button"
                  variant={scope === "pool_heads" ? "primary" : "secondary"}
                  onClick={() => onScopeChange("pool_heads")}
                  sx={scope === "pool_heads" ? gradientPrimaryButtonSx : undefined}
                >
                  Pool heads
                </Button>
              ) : null}
              {canUseDepartmentHeads ? (
                <Button
                  type="button"
                  variant={scope === "department_heads" ? "primary" : "secondary"}
                  onClick={() => onScopeChange("department_heads")}
                  sx={scope === "department_heads" ? gradientPrimaryButtonSx : undefined}
                >
                  Department heads
                </Button>
              ) : null}
            </Box>
          ) : null}
          <Box sx={approvalLeaveSearchWrapSx}>
            <SearchBar
              value={search}
              onChange={onSearchChange}
              placeholder="Search name or email…"
              sx={{ width: "100%" }}
            />
          </Box>
          <Box sx={{ minWidth: { xs: "100%", md: 180 } }}>
            <Calendar label="Date (UTC)" value={date} onChange={onDateChange} />
          </Box>
        </Box>
      </Box>

      {isLoading ? (
        <DataTable<TeamAttendanceTableRow>
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          minWidth={920}
          isLoading
        />
      ) : rows.length === 0 ? (
        <EmptyAttendanceState title={emptyTitle} subtitle={emptySubtitle} />
      ) : (
        <DataTable<TeamAttendanceTableRow>
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          minWidth={920}
        />
      )}

      <Box sx={rolesFooterRow}>
        <Typography variant="medium" sx={footerMutedText(theme)}>
          {footerText}
        </Typography>
        <Box sx={rolesPaginationWrapper}>
          <TablePagination page={page} pageCount={pageCount} onPageChange={onPageChange} />
        </Box>
      </Box>
    </DashboardCard>
  );
}
