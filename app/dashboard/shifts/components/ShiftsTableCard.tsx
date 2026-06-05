"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { Schedule as ScheduleIcon } from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { alpha, useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  DataTable,
  dataTableActionButton,
  SearchBar,
  SearchSubmitButton,
  TablePagination,
  ToolbarFilterPopover,
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
  /** UI label for API `catalog` (shown as Internal / External). */
  catalogLabel: string;
  /** `ownerResellerName` · `ownerParentCompanyName` when present. */
  ownerDisplay: string;
  /** Human-readable working week (from mask or `workingWeekdays`). */
  workingDaysSummary: string;
};

export type ShiftsTableCardProps = {
  rows: ShiftRow[];
  columns: DataTableColumn<ShiftRow>[];
  isLoading: boolean;
  /** Draft value in the search field. */
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  /** When `showSearchSubmitButton` is true: last-applied search for disabling the Search button. */
  appliedSearch?: string;
  onSearchApply?: () => void;
  /** If false, search is driven by the parent (e.g. debounced) without a Search button. Default true. */
  showSearchSubmitButton?: boolean;
  searchPlaceholder?: string;
  page: number;
  pageCount: number;
  footerText: string;
  onPageChange: (page: number) => void;
  onEdit: (row: ShiftRow) => void;
  onDelete: (row: ShiftRow) => void;
  disableActions: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  /** Shown under the main card title (optional). */
  cardSubtitle?: string;
  emptyState?: { title?: string; description?: string };
  /** When set with handlers, Filter opens this content in a popover. */
  filterPanel?: ReactNode;
  filterOpen?: boolean;
  onFilterOpenChange?: (open: boolean) => void;
  filterButtonActive?: boolean;
};

export function ShiftsTableCard({
  rows,
  columns,
  isLoading,
  searchInput,
  onSearchInputChange,
  appliedSearch = "",
  onSearchApply = () => {},
  showSearchSubmitButton = true,
  searchPlaceholder = "Search by shift name…",
  page,
  pageCount,
  footerText,
  onPageChange,
  onEdit,
  onDelete,
  disableActions,
  canEdit = true,
  canDelete = true,
  cardSubtitle,
  emptyState,
  filterPanel,
  filterOpen = false,
  onFilterOpenChange,
  filterButtonActive = false,
}: ShiftsTableCardProps) {
  const theme = useTheme() as AppTheme;

  const showFilter = filterPanel != null && onFilterOpenChange != null;

  return (
    <DashboardCard
      sx={
        [
          rolesCard,
          {
            overflow: "hidden",
            border: `1px solid ${alpha(theme.app.dashboard.white95, 0.14)}`,
          },
        ] as SxProps<Theme>
      }
    >
      <Box sx={[departmentsCardHeader, { pb: 1.25 }] as SxProps<Theme>}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, minWidth: 0 }}>
          <Box
            sx={
              [
                rolesIconBox,
                {
                  background: `linear-gradient(145deg, ${alpha(theme.app.dashboard.accentBlue, 0.35)} 0%, ${alpha(theme.app.dashboard.accentIndigo, 0.15)} 100%)`,
                  border: `1px solid ${alpha(theme.app.dashboard.white95, 0.2)}`,
                },
              ] as SxProps<Theme>
            }
          >
            <ScheduleIcon sx={{ fontSize: 22, color: theme.app.dashboard.white95 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="mediumLarge" fontWeight={700} color="white" sx={{ letterSpacing: "-0.02em" }}>
              Shift templates
            </Typography>
            {cardSubtitle ? (
              <Typography
                variant="caption"
                sx={{ display: "block", mt: 0.5, color: theme.app.dashboard.textMuted, lineHeight: 1.5, maxWidth: 560 }}
              >
                {cardSubtitle}
              </Typography>
            ) : null}
          </Box>
        </Box>

        <Box sx={departmentsSearchRow}>
          <Box sx={departmentsSearchFieldWrapper}>
            <SearchBar value={searchInput} onChange={onSearchInputChange} placeholder={searchPlaceholder} />
          </Box>
          {showSearchSubmitButton ? (
            <SearchSubmitButton
              disabled={searchInput.trim() === appliedSearch.trim()}
              onClick={onSearchApply}
            />
          ) : null}
          {showFilter ? (
            <ToolbarFilterPopover
              open={filterOpen}
              onOpenChange={onFilterOpenChange}
              active={filterButtonActive}
            >
              {filterPanel}
            </ToolbarFilterPopover>
          ) : null}
        </Box>
      </Box>

      <DataTable<ShiftRow>
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        minWidth={1000}
        emptyState={{
          title: emptyState?.title ?? "No shift templates",
          description: emptyState?.description ?? "No results for this search.",
        }}
        actionColumn={{
          label: "Actions",
          render: (row) => (
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
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

      <Box
        sx={
          [
            rolesFooterRow,
            { borderTop: `1px solid ${alpha(theme.app.dashboard.white95, 0.08)}`, pt: 1.5, mt: 0.5 },
          ] as SxProps<Theme>
        }
      >
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
