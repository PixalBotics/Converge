"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupsIcon from "@mui/icons-material/Groups";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  DashboardCard,
  DataTable,
  dataTableActionButton,
  SearchBar,
  SearchSubmitButton,
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
  departmentId: string;
};

export type PoolsTableCardProps = {
  rows: PoolRow[];
  columns: DataTableColumn<PoolRow>[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  /** When true, Search is disabled (draft matches applied). */
  searchSubmitDisabled?: boolean;
  page: number;
  pageCount: number;
  footerText: string;
  onPageChange: (page: number) => void;
  onEdit: (row: PoolRow) => void;
  onDelete: (row: PoolRow) => void;
  /** Pool members (HRMS APIs); hidden when user cannot list members. */
  onMembers?: (row: PoolRow) => void;
  disableActions: boolean;
  /** When false, row edit is hidden (operational `hrms:pool:update`). */
  canEdit?: boolean;
  /** When false, row delete is hidden (operational `hrms:pool:delete`). */
  canDelete?: boolean;
  /** `page:hrms` + pool view / org pool manage (list members). */
  canViewMembers?: boolean;
  /** Pool-members page: highlight selected pool row. */
  selectedPoolId?: string | null;
  /** Pool-members page: click row to select pool (edit/delete icons do not trigger this). */
  onPoolRowClick?: (row: PoolRow) => void;
  /** Override card title (default "Pools"). */
  tableCardTitle?: string;
};

export function PoolsTableCard({
  rows,
  columns,
  isLoading,
  search,
  onSearchChange,
  onSearchSubmit,
  searchSubmitDisabled = false,
  page,
  pageCount,
  footerText,
  onPageChange,
  onEdit,
  onDelete,
  onMembers,
  disableActions,
  canEdit = true,
  canDelete = true,
  canViewMembers = false,
  selectedPoolId = null,
  onPoolRowClick,
  tableCardTitle,
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
            {tableCardTitle ?? "Pools"}
          </Typography>
        </Box>

        <Box sx={departmentsSearchRow}>
          <Box sx={departmentsSearchFieldWrapper}>
            <SearchBar value={search} onChange={onSearchChange} placeholder="Search anything.." />
          </Box>
          <SearchSubmitButton
            disabled={isLoading || searchSubmitDisabled}
            onClick={onSearchSubmit}
          />
        </Box>
      </Box>

      <DataTable<PoolRow>
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        minWidth={640}
        selectedRowId={selectedPoolId}
        onRowClick={onPoolRowClick}
        actionColumn={{
          label: "Action",
          render: (row) => (
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }} onClick={(e) => e.stopPropagation()}>
              {canViewMembers && onMembers ? (
                <IconButton
                  size="small"
                  sx={dataTableActionButton}
                  aria-label="Pool members"
                  disabled={disableActions}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMembers(row);
                  }}
                >
                  <GroupsIcon fontSize="small" />
                </IconButton>
              ) : null}
              <IconButton
                size="small"
                sx={dataTableActionButton}
                aria-label="Edit pool"
                disabled={disableActions || !canEdit}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(row);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label="Delete pool"
                disabled={disableActions || !canDelete}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(row);
                }}
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

