import type { SxProps, Theme } from "@mui/material/styles";

export interface DataTableColumn<T = Record<string, unknown>> {
  /** Unique key matching row data */
  id: string;
  /** Header label */
  label: string;
  /** Cell text style: default (white) or muted (gray) */
  cellVariant?: "default" | "muted";
  /** Optional custom cell render: (value, row, index) => ReactNode */
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T = Record<string, unknown>> {
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Row data - each row is an object with keys matching column id */
  rows: T[];
  /** Optional: stable row id for keys. Default: (row, index) => String(index) */
  getRowId?: (row: T, index: number) => string | number;
  /** Optional action column: label and render function for each row */
  actionColumn?: {
    label: string;
    render: (row: T, index: number) => React.ReactNode;
  };
  /** Minimum table width (for horizontal scroll on small screens) */
  minWidth?: number;
  /** Table size */
  size?: "small" | "medium";
  /** Optional sx for Table root */
  tableSx?: SxProps<Theme>;
  /** Optional sx for TableContainer */
  containerSx?: SxProps<Theme>;
}
