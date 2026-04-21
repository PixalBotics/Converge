"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  DashboardCard,
  DataTable,
  dataTableActionButton,
  FilterButton,
  SearchBar,
  TablePagination,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import {
  rolesCard,
  rolesFooterRow,
  rolesIconBox,
  rolesPaginationWrapper,
} from "@/app/dashboard/roles/roles.styles";
import { footerMutedText } from "@/app/dashboard/companies/overview.styles";
import {
  departmentsCardHeader,
  departmentsSearchFieldWrapper,
  departmentsSearchRow,
} from "@/app/dashboard/website-assigning/website-assigning.styles";

export type ShiftRow = {
  id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  breakMinutes: number | null;
  timezone: string;
};

export type ShiftsTableCardProps = {
  rows: ShiftRow[];
  columns: DataTableColumn<ShiftRow>[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  page: number;
  pageCount: number;
  footerText: string;
  onPageChange: (page: number) => void;
  onEdit: (row: ShiftRow) => void;
  onDelete: (row: ShiftRow) => void;
  disableActions: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
};

export function ShiftsTableCard({
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
  canEdit = true,
  canDelete = true,
}: ShiftsTableCardProps) {
  const theme = useTheme() as AppTheme;

  return (
    <DashboardCard sx={rolesCard}>
      <Box sx={departmentsCardHeader}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={rolesIconBox}>
            <AttachMoneyIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Shifts
          </Typography>
        </Box>

        <Box sx={departmentsSearchRow}>
          <Box sx={departmentsSearchFieldWrapper}>
            <SearchBar value={search} onChange={onSearchChange} placeholder="Search anything.." />
          </Box>
          <FilterButton />
        </Box>
      </Box>

      <DataTable<ShiftRow>
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        minWidth={640}
        actionColumn={{
          label: "Action",
          render: (row) => (
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <IconButton
                size="small"
                sx={dataTableActionButton}
                aria-label="Edit shift"
                disabled={disableActions || !canEdit}
                onClick={() => onEdit(row)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label="Delete shift"
                disabled={disableActions || !canDelete}
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

