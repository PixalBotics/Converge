"use client";

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import type { SxProps, Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
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
}: DataTableProps<T>) {
  const sizeCellSx = size === "medium" ? { py: 1.5 } : { py: 1 };

  const getCellValue = (row: T, columnId: string): React.ReactNode => {
    const value = row[columnId];
    if (value === undefined || value === null) return "—";
    return String(value);
  };

  const skeletonRows = isLoading ? Array.from({ length: loadingRowCount }) : [];
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
          {(isLoading ? skeletonRows : rows).map((row, idx) => (
            <Box component="tr" key={String(isLoading ? `skeleton-${idx}` : getRowId(row as T, idx))}>
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
                <Box component="td" sx={sizeCellSx}>
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
          ))}
        </Box>
      </Box>
    </Box>
  );
}
