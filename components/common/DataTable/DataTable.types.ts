import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";

export interface DataTableColumn<T = Record<string, unknown>> {
  /** Unique key matching row data */
  id: string;
  /** Header label (ignored when `headerRender` is set) */
  label: string;
  /** Optional custom header cell (e.g. select-all checkbox) */
  headerRender?: () => ReactNode;
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
  /** When true, table body renders skeleton rows instead of data. */
  isLoading?: boolean;
  /** Number of skeleton rows to show when `isLoading` is true. */
  loadingRowCount?: number;
  /** Optional: stable row id for keys. Default: (row, index) => String(index) */
  getRowId?: (row: T, index: number) => string | number;
  /** Highlight the row whose id matches (via `getRowId`). */
  selectedRowId?: string | number | null;
  /** Whole-row click (e.g. select pool). Action cells should call `stopPropagation`. */
  onRowClick?: (row: T, index: number) => void;
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
  /**
   * When false, table wrapper does not use a vertical scroll container — parent (e.g. modal) scrolls.
   * Horizontal overflow for wide tables stays on (`overflow-x: auto`).
   */
  scrollY?: boolean;
}
