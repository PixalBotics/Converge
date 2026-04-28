"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import FilterList from "@mui/icons-material/FilterList";
import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  DataTable,
  dataTableActionButton,
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
} from "../approval-leave.styles";

export type ApprovalLeaveRow = {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  stage: string;
  applicantFirstName?: string;
  applicantLastName?: string;
  poolName?: string;
};

export type ApprovalLeaveTableCardProps = {
  queue: "pool" | "department";
  onQueueChange: (v: "pool" | "department") => void;
  search: string;
  onSearchChange: (v: string) => void;
  page: number;
  pageCount: number;
  onPageChange: (p: number) => void;
  footerText: string;
  isLoading: boolean;
  rows: ApprovalLeaveRow[];
  columns: DataTableColumn<ApprovalLeaveRow>[];
  onApprove: (rowId: string) => void;
  onReject: (rowId: string) => void;
  canApprove?: boolean;
  canReject?: boolean;
  canUsePoolQueue?: boolean;
  canUseDepartmentQueue?: boolean;
};

export function ApprovalLeaveTableCard({
  queue,
  onQueueChange,
  search,
  onSearchChange,
  page,
  pageCount,
  onPageChange,
  footerText,
  isLoading,
  rows,
  columns,
  onApprove,
  onReject,
  canApprove = true,
  canReject = true,
  canUsePoolQueue = true,
  canUseDepartmentQueue = true,
}: ApprovalLeaveTableCardProps) {
  const theme = useTheme() as AppTheme;

  return (
    <DashboardCard sx={rolesCard}>
      <Box sx={approvalLeaveCardHeaderSx}>
        <Box sx={approvalLeaveTitleRowSx}>
          <Box sx={approvalLeaveIconSx}>
            <AccessTimeRounded sx={{ fontSize: 14 }} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Pending leaves
          </Typography>
        </Box>

        <Box sx={approvalLeaveToolbarSx}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              type="button"
              variant={queue === "pool" ? "primary" : "secondary"}
              onClick={() => onQueueChange("pool")}
              disabled={!canUsePoolQueue}
              sx={queue === "pool" ? gradientPrimaryButtonSx : undefined}
            >
              Pool queue
            </Button>
            <Button
              type="button"
              variant={queue === "department" ? "primary" : "secondary"}
              onClick={() => onQueueChange("department")}
              disabled={!canUseDepartmentQueue}
              sx={queue === "department" ? gradientPrimaryButtonSx : undefined}
            >
              Department queue
            </Button>
          </Box>
          <Box sx={approvalLeaveSearchWrapSx}>
            <SearchBar value={search} onChange={onSearchChange} placeholder="Search anything..." sx={{ width: "100%" }} />
          </Box>
          <Button type="button" variant="secondary" startIcon={<FilterList sx={{ fontSize: 17 }} />} sx={{ minWidth: 96 }}>
            Filter
          </Button>
        </Box>
      </Box>

      <DataTable<ApprovalLeaveRow>
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        minWidth={720}
        actionColumn={{
          label: "Actions",
          render: (row) => (
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <IconButton
                size="small"
                sx={dataTableActionButton}
                aria-label="Approve leave"
                disabled={!canApprove}
                onClick={() => onApprove(row.id)}
              >
                <CheckIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{ ...dataTableActionButton, color: theme.app.dashboard.accentRedLight }}
                aria-label="Reject leave"
                disabled={!canReject}
                onClick={() => onReject(row.id)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ),
        }}
      />

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

