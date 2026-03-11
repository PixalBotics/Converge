"use client";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import type { SxProps, Theme } from "@mui/material/styles";
import type { DataTableProps } from "./DataTable.types";
import {
  dataTableRoot,
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
  const getCellValue = (row: T, columnId: string): React.ReactNode => {
    const value = row[columnId];
    if (value === undefined || value === null) return "—";
    return String(value);
  };

  return (
    <TableContainer
      sx={{
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        ...containerSx,
      }}
    >
      <Table
        size={size}
        sx={[
          dataTableRoot,
          { minWidth },
          ...(tableSx ? (Array.isArray(tableSx) ? tableSx : [tableSx]) : []),
        ]}
      >
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.id} sx={dataTableHeaderCell}>
                {col.label}
              </TableCell>
            ))}
            {actionColumn && (
              <TableCell sx={dataTableHeaderCell}>{actionColumn.label}</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={String(getRowId(row, idx))}>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  sx={
                    col.cellVariant === "muted"
                      ? dataTableCellMuted
                      : dataTableCellDefault
                  }
                >
                  {col.render
                    ? col.render(row[col.id], row, idx)
                    : getCellValue(row, col.id)}
                </TableCell>
              ))}
              {actionColumn && (
                <TableCell>{actionColumn.render(row, idx)}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
