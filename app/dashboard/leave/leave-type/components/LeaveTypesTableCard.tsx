"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  DataTable,
  dataTableActionButton,
  FilterButton,
  SearchBar,
  TablePagination,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { rolesCard, rolesFooterRow, rolesIconBox, rolesPaginationWrapper } from "@/app/dashboard/roles/roles.styles";
import { footerMutedText } from "@/app/dashboard/companies/overview.styles";
import {
  departmentsCardHeader,
  departmentsSearchFieldWrapper,
  departmentsSearchRow,
} from "@/app/dashboard/website-assigning/website-assigning.styles";

export type LeaveTypeRow = {
  id: string;
  name: string;
  description: string;
  maxDaysPerYear: number | null;
};

export type LeaveTypesTableCardProps = {
  rows: LeaveTypeRow[];
  columns: DataTableColumn<LeaveTypeRow>[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  page: number;
  pageCount: number;
  footerText: string;
  onPageChange: (page: number) => void;
  onEdit: (row: LeaveTypeRow) => void;
  onDelete: (row: LeaveTypeRow) => void;
  disableActions: boolean;
};

export function LeaveTypesTableCard({
  rows,
  columns,
  isLoading,
  search,
  onSearchChange,
  page,
  pageCount,
  footerText,
  onPageChange,
  onEdit,
  onDelete,
  disableActions,
}: LeaveTypesTableCardProps) {
  const theme = useTheme() as AppTheme;

  return (
    <DashboardCard sx={rolesCard}>
      <Box sx={departmentsCardHeader}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={rolesIconBox}>
            <AttachMoneyIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Leave Types
          </Typography>
        </Box>

        <Box sx={departmentsSearchRow}>
          <Box sx={departmentsSearchFieldWrapper}>
            <SearchBar value={search} onChange={onSearchChange} placeholder="Search anything.." />
          </Box>
          <FilterButton />
        </Box>
      </Box>

      <DataTable<LeaveTypeRow>
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        minWidth={700}
        actionColumn={{
          label: "Action",
          render: (row) => (
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <IconButton
                size="small"
                sx={dataTableActionButton}
                aria-label="Edit leave type"
                disabled={disableActions}
                onClick={() => onEdit(row)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label="Delete leave type"
                disabled={disableActions}
                onClick={() => onDelete(row)}
                sx={{
                  ...dataTableActionButton,
                  color: theme.app.dashboard.accentRedLight,
                  opacity: disableActions ? 0.7 : 1,
                }}
              >
                <DeleteIcon fontSize="small" />
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

