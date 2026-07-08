import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { mergeSx } from "@/lib/mui/merge-sx";
import { thinScrollbarsSx } from "@/lib/ui/thinScrollbars";

const dataTableContainerBase: SxProps<Theme> = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  overflowX: "auto",
  boxShadow: "none",
  WebkitOverflowScrolling: "touch",
};

/** Themed thin scrollbar when a table region scrolls. */
const dataTableScrollbarSx: SxProps<Theme> = thinScrollbarsSx;

/** TableContainer: scroll enabled; wide tables stay inside the card/page column. */
export const dataTableContainer: SxProps<Theme> = mergeSx(
  dataTableContainerBase,
  { overflowY: "auto" },
  dataTableScrollbarSx,
);

/** No vertical scroll region — parent (e.g. `FormModal` with `fitContent`) scrolls; wide tables still pan horizontally. */
export const dataTableContainerHorizontalOnly: SxProps<Theme> = mergeSx(
  dataTableContainerBase,
  { overflowY: "visible" },
  dataTableScrollbarSx,
);

export const dataTableRoot: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  const b = app.dashboard.cardBorder;
  return {
    width: "100%",
    borderCollapse: "collapse",
    boxShadow: "none",
    "& th, & td": {
      borderColor: b,
      borderBottom: `1px solid ${b}`,
      textAlign: "left",
      verticalAlign: "middle",
      padding: "10px 16px",
      whiteSpace: "normal",
    },
  };
};

export const dataTableHeaderCell: SxProps<Theme> = (theme) => ({
  color:
    theme.palette.mode === "light"
      ? (theme as AppTheme).app.text.primary
      : (theme as AppTheme).app.dashboard.white80,
  fontWeight: 600,
  fontSize: 18,
});

export const dataTableCellDefault: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.text.primary,
});

export const dataTableCellMuted: SxProps<Theme> = (theme) => ({
  color:
    theme.palette.mode === "light"
      ? (theme as AppTheme).app.text.primary
      : (theme as AppTheme).app.text.primary,
});

/** Empty-state row cell — no horizontal inset from default `th, td` padding. */
export const dataTableEmptyStateCell: SxProps<Theme> = {
  borderBottom: "none",
  padding: "0 !important",
};

export const dataTableActionButton: SxProps<Theme> = (theme) => ({
  color:
    theme.palette.mode === "light"
      ? (theme as AppTheme).app.text.primary
      : (theme as AppTheme).app.dashboard.white60,
});
