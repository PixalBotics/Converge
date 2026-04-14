"use client";

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import type { DataTableProps } from "./DataTable.types";
import {
  dataTableRoot,
  dataTableContainer,
  dataTableContainerHorizontalOnly,
  dataTableHeaderCell,
  dataTableCellDefault,
  dataTableCellMuted,
} from "./DataTable.styles";

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  getRowId = (_, index) => index,
  actionColumn,
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
          {rows.map((row, idx) => (
            <Box component="tr" key={String(getRowId(row, idx))}>
              {columns.map((col) => (
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
                  {col.render
                    ? col.render(row[col.id], row, idx)
                    : getCellValue(row, col.id)}
                </Box>
              ))}
              {actionColumn && (
                <Box component="td" sx={sizeCellSx}>
                  {actionColumn.render(row, idx)}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
