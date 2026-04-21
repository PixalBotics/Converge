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

export type PoolRow = {
  id: string;
  poolName: string;
  departmentName: string;
};

export type PoolsTableCardProps = {
  rows: PoolRow[];
  columns: DataTableColumn<PoolRow>[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  page: number;
  pageCount: number;
  footerText: string;
  onPageChange: (page: number) => void;
  onEdit: (row: PoolRow) => void;
  onDelete: (row: PoolRow) => void;
  disableActions: boolean;
  /** When false, row edit is hidden (operational `hrms:pool:update`). */
  canEdit?: boolean;
  /** When false, row delete is hidden (operational `hrms:pool:delete`). */
  canDelete?: boolean;
};

export function PoolsTableCard({
  rows,
  columns,
  isLoading,
  search,
  onSearchChange,
  onSearchSubmit,
  page,
  pageCount,
  footerText,
  onPageChange,
  onEdit,
  onDelete,
  disableActions,
  canEdit = true,
  canDelete = true,
}: PoolsTableCardProps) {
  const theme = useTheme() as AppTheme;

  return (
    <DashboardCard sx={rolesCard}>
      <Box sx={departmentsCardHeader}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={rolesIconBox}>
            <AttachMoneyIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Pools
          </Typography>
        </Box>

        <Box sx={departmentsSearchRow}>
          <Box sx={departmentsSearchFieldWrapper}>
            <SearchBar value={search} onChange={onSearchChange} placeholder="Search anything.." />
          </Box>
          <Button variant="outlined" onClick={onSearchSubmit} disabled={isLoading}>
            Search
          </Button>
          <FilterButton />
        </Box>
      </Box>

      <DataTable<PoolRow>
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
                aria-label="Edit pool"
                disabled={disableActions || !canEdit}
                onClick={() => onEdit(row)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label="Delete pool"
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

