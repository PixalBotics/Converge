"use client";

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import { AccessTimeOutlined as AccessTimeOutlinedIcon } from "@mui/icons-material";
import type { DataTableProps } from "./DataTable.types";
import {
  dataTableRoot,
  dataTableContainer,
  dataTableContainerHorizontalOnly,
  dataTableHeaderCell,
  dataTableCellDefault,
  dataTableCellMuted,
} from "./DataTable.styles";
import type { AppTheme } from "@/theme/theme";

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  getRowId = (_, index) => index,
  actionColumn,
  isLoading = false,
  loadingRowCount = 8,
  minWidth = 560,
  size = "small",
  tableSx,
  containerSx,
  scrollY = true,
  selectedRowId = null,
  onRowClick,
  emptyState,
}: DataTableProps<T>) {
  const sizeCellSx = size === "medium" ? { py: 1.5 } : { py: 1 };

  const getCellValue = (row: T, columnId: string): React.ReactNode => {
    const value = row[columnId];
    if (value === undefined || value === null) return "—";
    return String(value);
  };

  const skeletonRows = isLoading ? Array.from({ length: loadingRowCount }) : [];
  const hasRows = rows.length > 0;
  const shouldShowEmptyState = !isLoading && !hasRows;
  const EmptyStateIcon = emptyState?.icon ?? AccessTimeOutlinedIcon;
  const skeletonBaseSx = (theme: Theme) => {
    const app = (theme as AppTheme).app;
    return {
      bgcolor:
        theme.palette.mode === "light"
          ? alpha(app.text.primary, 0.08)
          : alpha(app.dashboard.white95, 0.08),
      borderRadius: "10px",
    };
  };

  return (
    <Box
      sx={[
        scrollY ? dataTableContainer : dataTableContainerHorizontalOnly,
        ...(containerSx ? (Array.isArray(containerSx) ? containerSx : [containerSx]) : []),
      ]}
    >
      <Box
        component="table"
        sx={[
          dataTableRoot,
          { minWidth },
          ...(tableSx ? (Array.isArray(tableSx) ? tableSx : [tableSx]) : []),
        ]}
      >
        <Box component="thead">
          <Box component="tr">
            {columns.map((col) => (
              <Box
                key={col.id}
                component="th"
                sx={[dataTableHeaderCell, sizeCellSx] as SxProps<Theme>}
              >
                {col.headerRender ? col.headerRender() : col.label}
              </Box>
            ))}
            {actionColumn && (
              <Box
                component="th"
                sx={[dataTableHeaderCell, sizeCellSx] as SxProps<Theme>}
              >
                {actionColumn.label}
              </Box>
            )}
          </Box>
        </Box>
        <Box component="tbody">
          {shouldShowEmptyState ? (
            <Box component="tr">
              <Box component="td" colSpan={columns.length + (actionColumn ? 1 : 0)} sx={{ borderBottom: "none", px: 0, py: 0 }}>
                <Box
                  sx={(theme) => {
                    const app = (theme as AppTheme).app;
                    return {
                      mx: { xs: 1, sm: 1.5, md: 2 },
                      my: { xs: 1.25, sm: 1.75, md: 2.25 },
                      borderRadius: 3.5,
                      border: `1px solid ${alpha(app.dashboard.white95, 0.14)}`,
                      boxShadow: `inset 0 1px 0 ${alpha(app.dashboard.white95, 0.08)}`,
                      bgcolor: alpha(app.dashboard.overlayLight, 0.52),
                      minHeight: 190,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      gap: 0.9,
                      px: 2.5,
                      py: 2,
                    };
                  }}
                >
                  <Box
                    sx={(theme) => ({
                      width: 54,
                      height: 54,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      color: (theme as AppTheme).app.dashboard.white95,
                      border: `1px solid ${alpha((theme as AppTheme).app.dashboard.white95, 0.18)}`,
                      background: `linear-gradient(180deg, ${alpha((theme as AppTheme).app.dashboard.white95, 0.16)} 0%, ${alpha((theme as AppTheme).app.dashboard.white95, 0.05)} 100%)`,
                    })}
                  >
                    <EmptyStateIcon sx={{ fontSize: 26 }} />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: (theme) => alpha((theme as AppTheme).app.dashboard.white95, 0.72),
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    Empty State
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: (theme) => (theme as AppTheme).app.dashboard.white95, fontWeight: 600 }}>
                    {emptyState?.title ?? "No records yet"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: (theme) => (theme as AppTheme).app.dashboard.textMuted, maxWidth: 520, lineHeight: 1.55 }}>
                    {emptyState?.description ?? "There is no data available for the current filter."}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : null}
          {(isLoading ? skeletonRows : rows).map((row, idx) => {
            const rowId = String(isLoading ? `skeleton-${idx}` : getRowId(row as T, idx));
            const selected =
              !isLoading &&
              onRowClick &&
              selectedRowId != null &&
              selectedRowId !== "" &&
              rowId === String(selectedRowId);
            return (
            <Box
              component="tr"
              key={rowId}
              onClick={
                isLoading || !onRowClick
                  ? undefined
                  : () => {
                      onRowClick(row as T, idx);
                    }
              }
              sx={
                [
                  selected
                    ? {
                        bgcolor: (t: Theme) =>
                          alpha((t as AppTheme).palette.primary.main, t.palette.mode === "light" ? 0.12 : 0.2),
                        boxShadow: (t: Theme) => `inset 0 0 0 1px ${alpha((t as AppTheme).palette.primary.main, 0.35)}`,
                      }
                    : null,
                  onRowClick && !isLoading
                    ? { cursor: "pointer", "&:hover": { bgcolor: (t: Theme) => alpha((t as AppTheme).app.text.primary, 0.06) } }
                    : null,
                ] as SxProps<Theme>
              }
            >
              {columns.map((col, colIdx) => (
                <Box
                  key={col.id}
                  component="td"
                  sx={
                    [
                      col.cellVariant === "muted" ? dataTableCellMuted : dataTableCellDefault,
                      sizeCellSx,
                    ] as SxProps<Theme>
                  }
                >
                  {isLoading ? (
                    <Skeleton
                      variant="text"
                      sx={skeletonBaseSx}
                      height={18}
                      width={`${Math.max(30, 78 - colIdx * 10)}%`}
                    />
                  ) : col.render ? (
                    col.render((row as T)[col.id], row as T, idx)
                  ) : (
                    getCellValue(row as T, col.id)
                  )}
                </Box>
              ))}
              {actionColumn && (
                <Box component="td" sx={sizeCellSx} onClick={(e) => e.stopPropagation()}>
                  {isLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Skeleton variant="rounded" sx={skeletonBaseSx} height={28} width={72} />
                    </Box>
                  ) : (
                    actionColumn.render(row as T, idx)
                  )}
                </Box>
              )}
            </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
