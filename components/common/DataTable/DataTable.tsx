"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { DataTableProps } from "./DataTable.types";
import {
  dataTableRoot,
  dataTableContainer,
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
}: DataTableProps<T>) {
  const theme = useTheme();
  const sizeCellSx = size === "medium" ? { py: 1.5 } : { py: 1 };
  const resolve = (sx: typeof dataTableHeaderCell) =>
    typeof sx === "function" ? sx(theme) : sx;

  const getCellValue = (row: T, columnId: string): React.ReactNode => {
    const value = row[columnId];
    if (value === undefined || value === null) return "—";
    return String(value);
  };

  return (
    <Box
      sx={[dataTableContainer, ...(containerSx ? (Array.isArray(containerSx) ? containerSx : [containerSx]) : [])]}
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
                sx={{ ...resolve(dataTableHeaderCell), ...sizeCellSx }}
              >
                {col.label}
              </Box>
            ))}
            {actionColumn && (
              <Box component="th" sx={{ ...resolve(dataTableHeaderCell), ...sizeCellSx }}>
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
                  sx={{
                    ...resolve(
                      col.cellVariant === "muted" ? dataTableCellMuted : dataTableCellDefault
                    ),
                    ...sizeCellSx,
                  }}
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
